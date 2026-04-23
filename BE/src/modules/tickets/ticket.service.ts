import { TicketStatus, TicketPriority, TicketChannel, UserRole, Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { recordAudit } from '@/utils/auditLog';
import { slaQueue, emailQueue, webhookQueue } from '@/jobs/queues';

// Valid status transitions per TDD state machine
const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.ON_HOLD, TicketStatus.CLOSED],
  [TicketStatus.OPEN]: [TicketStatus.PENDING, TicketStatus.ON_HOLD, TicketStatus.SOLVED, TicketStatus.CLOSED],
  [TicketStatus.PENDING]: [TicketStatus.OPEN, TicketStatus.ON_HOLD, TicketStatus.SOLVED, TicketStatus.CLOSED],
  [TicketStatus.ON_HOLD]: [TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.SOLVED],
  [TicketStatus.SOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

function validateTransition(from: TicketStatus, to: TicketStatus): void {
  if (!VALID_TRANSITIONS[from]?.includes(to)) {
    throw new AppError(400, 'Bad Request', `Invalid status transition: ${from} → ${to}`);
  }
}

function canViewTicket(ticket: { requesterId: string; orgId: string }, userId: string, role: string, orgId: string): boolean {
  if (ticket.orgId !== orgId) return false;
  const agentRoles: string[] = [UserRole.ADMIN, UserRole.TEAM_LEAD, UserRole.AGENT, UserRole.VIEWER];
  if (agentRoles.includes(role)) return true;
  if (role === UserRole.CUSTOMER) return ticket.requesterId === userId;
  return false;
}

interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  teamId?: string;
  channel?: TicketChannel;
  cursor?: string;
  limit: number;
}

export async function createTicket(
  orgId: string,
  requesterId: string,
  subject: string,
  description: string,
  priority: TicketPriority,
  channel: TicketChannel,
  customFields?: Record<string, unknown>,
) {
  // Find applicable SLA policy
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { defaultSlaPolicy: true },
  });

  let slaBreachAt: Date | undefined;
  let slaPolicyId: string | undefined;

  if (org?.defaultSlaPolicy) {
    slaPolicyId = org.defaultSlaPolicy.id;
    slaBreachAt = new Date(Date.now() + org.defaultSlaPolicy.resolutionMinutes * 60 * 1000);
  }

  const ticket = await prisma.ticket.create({
    data: {
      orgId,
      requesterId,
      subject,
      description,
      priority,
      channel,
      status: TicketStatus.NEW,
      customFields: customFields ? (customFields as Prisma.InputJsonValue) : undefined,
      slaBreachAt,
      slaPolicyId,
    },
    include: { requester: { select: { id: true, name: true, email: true } } },
  });

  await recordAudit({ entityType: 'ticket', entityId: ticket.id, action: 'created', actorId: requesterId });

  // Enqueue background jobs
  await emailQueue.add('send-acknowledgement', { ticketId: ticket.id, requesterId, orgId });
  if (slaBreachAt) {
    await slaQueue.add('check-sla-breach', { ticketId: ticket.id }, { delay: slaBreachAt.getTime() - Date.now() });
  }
  await webhookQueue.add('dispatch', { event: 'ticket.created', orgId, payload: { ticketId: ticket.id } });

  return ticket;
}

export async function listTickets(
  orgId: string,
  userId: string,
  role: string,
  filters: TicketFilters,
) {
  const tickets = await prisma.ticket.findMany({
    where: {
      orgId,
      deletedAt: null,
      ...(role === UserRole.CUSTOMER ? { requesterId: userId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters.teamId ? { teamId: filters.teamId } : {}),
      ...(filters.channel ? { channel: filters.channel } : {}),
      ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
    },
    take: filters.limit + 1,
    orderBy: { updatedAt: 'desc' },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
      slaPolicy: true,
    },
  });

  return tickets;
}

export async function getTicket(orgId: string, ticketId: string, userId: string, role: string) {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId, deletedAt: null },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
      slaPolicy: true,
      attachments: true,
    },
  });

  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');
  if (!canViewTicket(ticket, userId, role, orgId)) {
    throw new AppError(403, 'Forbidden', 'Not allowed to view this ticket');
  }

  return ticket;
}

export async function updateTicketStatus(
  orgId: string,
  ticketId: string,
  newStatus: TicketStatus,
  actorId: string,
  role: string,
) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');

  if (role === UserRole.CUSTOMER && ticket.requesterId !== actorId) {
    throw new AppError(403, 'Forbidden', 'Not allowed to change this ticket status');
  }

  validateTransition(ticket.status, newStatus);

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: newStatus },
  });

  await recordAudit({
    entityType: 'ticket', entityId: ticketId, action: 'status_changed', actorId,
    diff: { from: ticket.status, to: newStatus },
  });

  await webhookQueue.add('dispatch', { event: 'ticket.status_changed', orgId, payload: { ticketId, status: newStatus } });

  if (newStatus === TicketStatus.CLOSED) {
    // Enqueue CSAT survey
    await emailQueue.add('send-csat', { ticketId, orgId }, { delay: 60 * 1000 });
  }

  return updated;
}

export async function assignTicket(
  orgId: string,
  ticketId: string,
  assigneeId: string | null,
  teamId: string | null,
  actorId: string,
) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assigneeId: assigneeId ?? undefined,
      teamId: teamId ?? undefined,
      status: ticket.status === TicketStatus.NEW ? TicketStatus.OPEN : ticket.status,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  await recordAudit({ entityType: 'ticket', entityId: ticketId, action: 'assigned', actorId, diff: { assigneeId, teamId } });
  await webhookQueue.add('dispatch', { event: 'ticket.assigned', orgId, payload: { ticketId, assigneeId } });

  return updated;
}

export async function updateTicket(
  orgId: string,
  ticketId: string,
  actorId: string,
  data: { subject?: string; description?: string; priority?: TicketPriority; customFields?: Record<string, unknown> },
) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ...(data.subject ? { subject: data.subject } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.customFields ? { customFields: data.customFields as Prisma.InputJsonValue } : {}),
    },
  });

  await recordAudit({ entityType: 'ticket', entityId: ticketId, action: 'updated', actorId, diff: data as Record<string, unknown> });
  return updated;
}

export async function deleteTicket(orgId: string, ticketId: string, actorId: string) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');
  await prisma.ticket.update({ where: { id: ticketId }, data: { deletedAt: new Date() } });
  await recordAudit({ entityType: 'ticket', entityId: ticketId, action: 'deleted', actorId });
}
