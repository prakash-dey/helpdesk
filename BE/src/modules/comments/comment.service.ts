import { UserRole } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { recordAudit } from '@/utils/auditLog';
import { emailQueue, webhookQueue } from '@/jobs/queues';

function canViewInternal(role: string): boolean {
  const internalRoles: string[] = [UserRole.ADMIN, UserRole.TEAM_LEAD, UserRole.AGENT];
  return internalRoles.includes(role);
}

export async function listComments(
  orgId: string,
  ticketId: string,
  userId: string,
  role: string,
) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');

  if (role === UserRole.CUSTOMER && ticket.requesterId !== userId) {
    throw new AppError(403, 'Forbidden', 'Not allowed to view comments');
  }

  return prisma.comment.findMany({
    where: {
      ticketId,
      deletedAt: null,
      ...(canViewInternal(role) ? {} : { isInternal: false }),
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      attachments: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createComment(
  orgId: string,
  ticketId: string,
  authorId: string,
  role: string,
  body: string,
  isInternal: boolean,
) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');

  if (role === UserRole.CUSTOMER && ticket.requesterId !== authorId) {
    throw new AppError(403, 'Forbidden', 'Not allowed to comment on this ticket');
  }

  if (isInternal && !canViewInternal(role)) {
    throw new AppError(403, 'Forbidden', 'Customers cannot post internal notes');
  }

  const comment = await prisma.comment.create({
    data: { ticketId, authorId, body: body.trim(), isInternal },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
  });

  await recordAudit({ entityType: 'comment', entityId: comment.id, action: 'created', actorId: authorId });

  if (!isInternal) {
    await emailQueue.add('send-comment-notification', { ticketId, commentId: comment.id, orgId });
    await webhookQueue.add('dispatch', { event: 'comment.added', orgId, payload: { ticketId, commentId: comment.id } });
  }

  return comment;
}

export async function updateComment(
  orgId: string,
  ticketId: string,
  commentId: string,
  authorId: string,
  body: string,
) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, ticketId, ticket: { orgId }, deletedAt: null },
  });
  if (!comment) throw new AppError(404, 'Not Found', 'Comment not found');
  if (comment.authorId !== authorId) throw new AppError(403, 'Forbidden', 'Not allowed to edit this comment');

  return prisma.comment.update({ where: { id: commentId }, data: { body: body.trim() } });
}

export async function deleteComment(
  orgId: string,
  ticketId: string,
  commentId: string,
  actorId: string,
  role: string,
) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, ticketId, ticket: { orgId }, deletedAt: null },
  });
  if (!comment) throw new AppError(404, 'Not Found', 'Comment not found');

  if (role !== UserRole.ADMIN && comment.authorId !== actorId) {
    throw new AppError(403, 'Forbidden', 'Not allowed to delete this comment');
  }

  await prisma.comment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
}
