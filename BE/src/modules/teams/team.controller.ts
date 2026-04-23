import { Request, Response } from 'express';
import { z } from 'zod';
import * as teamService from './team.service';

export async function listTeams(req: Request, res: Response): Promise<void> {
  const teams = await teamService.listTeams(req.params.orgId);
  res.json({ data: teams });
}

export async function createTeam(req: Request, res: Response): Promise<void> {
  const { name } = z.object({ name: z.string().min(1).max(100) }).parse(req.body);
  const team = await teamService.createTeam(req.params.orgId, name, req.userId!);
  res.status(201).json({ data: team });
}

export async function getTeam(req: Request, res: Response): Promise<void> {
  const team = await teamService.getTeam(req.params.orgId, req.params.teamId);
  res.json({ data: team });
}

export async function updateTeam(req: Request, res: Response): Promise<void> {
  const { name } = z.object({ name: z.string().min(1).max(100) }).parse(req.body);
  const team = await teamService.updateTeam(req.params.orgId, req.params.teamId, name, req.userId!);
  res.json({ data: team });
}

export async function deleteTeam(req: Request, res: Response): Promise<void> {
  await teamService.deleteTeam(req.params.orgId, req.params.teamId, req.userId!);
  res.status(204).end();
}

export async function addTeamMember(req: Request, res: Response): Promise<void> {
  const { userId } = z.object({ userId: z.string().uuid() }).parse(req.body);
  const member = await teamService.addTeamMember(req.params.orgId, req.params.teamId, userId, req.userId!);
  res.status(201).json({ data: member });
}

export async function removeTeamMember(req: Request, res: Response): Promise<void> {
  await teamService.removeTeamMember(req.params.orgId, req.params.teamId, req.params.userId, req.userId!);
  res.status(204).end();
}
