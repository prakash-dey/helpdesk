import { Request, Response } from 'express';
import { z } from 'zod';
import * as webhookService from './webhook.service';

export async function listWebhooks(req: Request, res: Response): Promise<void> {
  const webhooks = await webhookService.listWebhooks(req.params.orgId);
  res.json({ data: webhooks });
}

export async function createWebhook(req: Request, res: Response): Promise<void> {
  const { url, events } = z.object({
    url: z.string().url(),
    events: z.array(z.string()).min(1),
  }).parse(req.body);
  const webhook = await webhookService.createWebhook(req.params.orgId, url, events);
  res.status(201).json({ data: webhook });
}

export async function updateWebhook(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    url: z.string().url().optional(),
    events: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  });
  const data = schema.parse(req.body);
  const webhook = await webhookService.updateWebhook(req.params.orgId, req.params.webhookId, data);
  res.json({ data: webhook });
}

export async function deleteWebhook(req: Request, res: Response): Promise<void> {
  await webhookService.deleteWebhook(req.params.orgId, req.params.webhookId);
  res.status(204).end();
}

export async function rotateSecret(req: Request, res: Response): Promise<void> {
  const webhook = await webhookService.rotateSecret(req.params.orgId, req.params.webhookId);
  res.json({ data: webhook });
}
