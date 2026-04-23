import { Request, Response } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import * as orgService from './organization.service';

export async function getOrg(req: Request, res: Response): Promise<void> {
  const org = await orgService.getOrg(req.params.orgId);
  res.json({ data: org });
}

export async function updateOrg(req: Request, res: Response): Promise<void> {
  const schema = z.object({ name: z.string().optional(), domain: z.string().optional(), planTier: z.string().optional() });
  const data = schema.parse(req.body);
  const org = await orgService.updateOrg(req.params.orgId, req.userId!, data);
  res.json({ data: org });
}

export async function getMembers(req: Request, res: Response): Promise<void> {
  const members = await orgService.getMembers(req.params.orgId);
  res.json({ data: members });
}

export async function updateMemberRoles(req: Request, res: Response): Promise<void> {
  const schema = z.object({ roles: z.array(z.nativeEnum(UserRole)) });
  const { roles } = schema.parse(req.body);
  const m = await orgService.updateMemberRoles(req.params.orgId, req.params.userId, roles, req.userId!);
  res.json({ data: m });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  await orgService.removeMember(req.params.orgId, req.params.userId, req.userId!);
  res.status(204).end();
}

export async function createInvitation(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    email: z.string().email(),
    rolesToGrant: z.array(z.nativeEnum(UserRole)).min(1),
  });
  const { email, rolesToGrant } = schema.parse(req.body);
  const result = await orgService.createInvitation(req.params.orgId, req.userId!, email, rolesToGrant);
  res.status(201).json({ data: result });
}

export async function listInvitations(req: Request, res: Response): Promise<void> {
  const invitations = await orgService.listInvitations(req.params.orgId);
  res.json({ data: invitations });
}

export async function revokeInvitation(req: Request, res: Response): Promise<void> {
  await orgService.revokeInvitation(req.params.orgId, req.params.invitationId);
  res.status(204).end();
}
