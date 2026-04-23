import { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './canned-response.service';

export async function list(req: Request, res: Response): Promise<void> {
  const data = await service.listCannedResponses(
    req.params.orgId,
    req.query.teamId as string | undefined,
    req.query.search as string | undefined,
  );
  res.json({ data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = z.object({ title: z.string().min(1), body: z.string().min(1), teamId: z.string().uuid().optional() }).parse(req.body);
  const cr = await service.createCannedResponse(req.params.orgId, req.userId!, body);
  res.status(201).json({ data: cr });
}

export async function update(req: Request, res: Response): Promise<void> {
  const body = z.object({ title: z.string().optional(), body: z.string().optional(), teamId: z.string().uuid().optional() }).parse(req.body);
  const cr = await service.updateCannedResponse(req.params.orgId, req.params.id, body);
  res.json({ data: cr });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.deleteCannedResponse(req.params.orgId, req.params.id);
  res.status(204).end();
}
