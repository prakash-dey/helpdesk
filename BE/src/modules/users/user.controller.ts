import { Request, Response } from 'express';
import { z } from 'zod';
import * as userService from './user.service';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req.userId!);
  res.json({ data: user });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const schema = z.object({ name: z.string().min(1).max(100).optional() });
  const data = schema.parse(req.body);
  const user = await userService.updateProfile(req.userId!, data);
  res.json({ data: user });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req.params.userId);
  res.json({ data: user });
}

export async function listOrgUsers(req: Request, res: Response): Promise<void> {
  const users = await userService.listOrgUsers(req.params.orgId);
  res.json({ data: users });
}

export async function deactivateUser(req: Request, res: Response): Promise<void> {
  await userService.deactivateUser(req.params.userId);
  res.status(204).end();
}
