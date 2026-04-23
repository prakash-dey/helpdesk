import { Request, Response } from 'express';
import { z } from 'zod';
import * as attachmentService from './attachment.service';

export async function presignUpload(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    filename: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().positive(),
  });
  const data = schema.parse(req.body);
  const result = await attachmentService.presignUpload(
    req.params.orgId, req.params.ticketId, data.filename, data.mimeType, data.sizeBytes,
  );
  res.status(201).json({ data: result });
}

export async function listAttachments(req: Request, res: Response): Promise<void> {
  const attachments = await attachmentService.listTicketAttachments(req.params.orgId, req.params.ticketId);
  res.json({ data: attachments });
}

export async function getDownloadUrl(req: Request, res: Response): Promise<void> {
  const url = await attachmentService.getDownloadUrl(req.params.attachmentId, req.params.orgId);
  res.json({ data: { url } });
}

export async function deleteAttachment(req: Request, res: Response): Promise<void> {
  await attachmentService.deleteAttachment(req.params.attachmentId, req.params.orgId);
  res.status(204).end();
}
