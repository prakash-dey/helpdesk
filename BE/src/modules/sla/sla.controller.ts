import { Request, Response } from 'express';
import { z } from 'zod';
import { TicketPriority } from '@prisma/client';
import * as slaService from './sla.service';

export async function listSlaPolicies(req: Request, res: Response): Promise<void> {
  const policies = await slaService.listSlaPolicies(req.params.orgId);
  res.json({ data: policies });
}

export async function createSlaPolicy(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    name: z.string().min(1).max(100),
    priority: z.nativeEnum(TicketPriority),
    firstResponseMinutes: z.number().positive(),
    resolutionMinutes: z.number().positive(),
  });
  const data = schema.parse(req.body);
  const policy = await slaService.createSlaPolicy(req.params.orgId, req.userId!, data);
  res.status(201).json({ data: policy });
}

export async function updateSlaPolicy(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    name: z.string().optional(),
    firstResponseMinutes: z.number().positive().optional(),
    resolutionMinutes: z.number().positive().optional(),
  });
  const data = schema.parse(req.body);
  const policy = await slaService.updateSlaPolicy(req.params.orgId, req.params.policyId, req.userId!, data);
  res.json({ data: policy });
}

export async function deleteSlaPolicy(req: Request, res: Response): Promise<void> {
  await slaService.deleteSlaPolicy(req.params.orgId, req.params.policyId, req.userId!);
  res.status(204).end();
}

export async function setDefaultSlaPolicy(req: Request, res: Response): Promise<void> {
  const { policyId } = z.object({ policyId: z.string().uuid() }).parse(req.body);
  await slaService.setDefaultSlaPolicy(req.params.orgId, policyId, req.userId!);
  res.json({ data: { message: 'Default SLA policy updated' } });
}
