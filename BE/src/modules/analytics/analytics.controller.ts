import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';

function parseDateRange(req: Request): { from: Date; to: Date } {
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  return { from, to };
}

export async function getTicketStats(req: Request, res: Response): Promise<void> {
  const { from, to } = parseDateRange(req);
  const stats = await analyticsService.getTicketStats(req.params.orgId, from, to);
  res.json({ data: stats });
}

export async function getSlaBreach(req: Request, res: Response): Promise<void> {
  const { from, to } = parseDateRange(req);
  const stats = await analyticsService.getSlaBreach(req.params.orgId, from, to);
  res.json({ data: stats });
}

export async function getCsatStats(req: Request, res: Response): Promise<void> {
  const { from, to } = parseDateRange(req);
  const stats = await analyticsService.getCsatStats(req.params.orgId, from, to);
  res.json({ data: stats });
}

export async function getAgentStats(req: Request, res: Response): Promise<void> {
  const { from, to } = parseDateRange(req);
  const stats = await analyticsService.getAgentStats(req.params.orgId, from, to);
  res.json({ data: stats });
}

export async function getAuditLog(req: Request, res: Response): Promise<void> {
  const entityType = req.query.entityType as string | undefined;
  const cursor = req.query.cursor as string | undefined;
  const logs = await analyticsService.getAuditLog(req.params.orgId, entityType, cursor);
  res.json({ data: logs });
}
