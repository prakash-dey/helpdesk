import { Request, Response } from 'express';
import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketChannel, UserRole } from '@prisma/client';
import * as ticketService from './ticket.service';
import { parsePaginationParams, buildCursorPage } from '@/utils/pagination';

export async function createTicket(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    subject: z.string().min(1).max(255),
    description: z.string().min(1),
    priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
    channel: z.nativeEnum(TicketChannel).optional().default(TicketChannel.WEB),
    customFields: z.record(z.unknown()).optional(),
  });
  const data = schema.parse(req.body);
  const ticket = await ticketService.createTicket(
    req.params.orgId, req.userId!, data.subject, data.description,
    data.priority, data.channel, data.customFields,
  );
  res.status(201).json({ data: ticket });
}

export async function listTickets(req: Request, res: Response): Promise<void> {
  const { cursor, limit } = parsePaginationParams(req);
  const filters = {
    status: req.query.status as TicketStatus | undefined,
    priority: req.query.priority as TicketPriority | undefined,
    assigneeId: req.query.assigneeId as string | undefined,
    teamId: req.query.teamId as string | undefined,
    channel: req.query.channel as TicketChannel | undefined,
    cursor,
    limit,
  };
  const tickets = await ticketService.listTickets(req.params.orgId, req.userId!, req.userRole!, filters);
  res.json(buildCursorPage(tickets, limit));
}

export async function getTicket(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.getTicket(req.params.orgId, req.params.ticketId, req.userId!, req.userRole!);
  res.json({ data: ticket });
}

export async function updateTicketStatus(req: Request, res: Response): Promise<void> {
  const { status } = z.object({ status: z.nativeEnum(TicketStatus) }).parse(req.body);
  const ticket = await ticketService.updateTicketStatus(req.params.orgId, req.params.ticketId, status, req.userId!, req.userRole!);
  res.json({ data: ticket });
}

export async function assignTicket(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    assigneeId: z.string().uuid().nullable().optional(),
    teamId: z.string().uuid().nullable().optional(),
  });
  const { assigneeId, teamId } = schema.parse(req.body);
  const ticket = await ticketService.assignTicket(req.params.orgId, req.params.ticketId, assigneeId ?? null, teamId ?? null, req.userId!);
  res.json({ data: ticket });
}

export async function updateTicket(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    subject: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    customFields: z.record(z.unknown()).optional(),
  });
  const data = schema.parse(req.body);
  const ticket = await ticketService.updateTicket(req.params.orgId, req.params.ticketId, req.userId!, data);
  res.json({ data: ticket });
}

export async function deleteTicket(req: Request, res: Response): Promise<void> {
  await ticketService.deleteTicket(req.params.orgId, req.params.ticketId, req.userId!);
  res.status(204).end();
}
