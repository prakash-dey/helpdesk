import { Request, Response } from 'express';
import { z } from 'zod';
import * as commentService from './comment.service';

export async function listComments(req: Request, res: Response): Promise<void> {
  const comments = await commentService.listComments(
    req.params.orgId, req.params.ticketId, req.userId!, req.userRole!,
  );
  res.json({ data: comments });
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    body: z.string().min(1),
    isInternal: z.boolean().optional().default(false),
  });
  const { body, isInternal } = schema.parse(req.body);
  const comment = await commentService.createComment(
    req.params.orgId, req.params.ticketId, req.userId!, req.userRole!, body, isInternal,
  );
  res.status(201).json({ data: comment });
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  const { body } = z.object({ body: z.string().min(1) }).parse(req.body);
  const comment = await commentService.updateComment(
    req.params.orgId, req.params.ticketId, req.params.commentId, req.userId!, body,
  );
  res.json({ data: comment });
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  await commentService.deleteComment(
    req.params.orgId, req.params.ticketId, req.params.commentId, req.userId!, req.userRole!,
  );
  res.status(204).end();
}
