import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { recordAudit } from '@/utils/auditLog';

export async function listTeams(orgId: string) {
  return prisma.team.findMany({
    where: { orgId, deletedAt: null },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    orderBy: { name: 'asc' },
  });
}

export async function createTeam(orgId: string, name: string, actorId: string) {
  const team = await prisma.team.create({ data: { name, orgId } });
  await recordAudit({ entityType: 'team', entityId: team.id, action: 'created', actorId });
  return team;
}

export async function getTeam(orgId: string, teamId: string) {
  const team = await prisma.team.findFirst({
    where: { id: teamId, orgId, deletedAt: null },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });
  if (!team) throw new AppError(404, 'Not Found', 'Team not found');
  return team;
}

export async function updateTeam(orgId: string, teamId: string, name: string, actorId: string) {
  const team = await prisma.team.findFirst({ where: { id: teamId, orgId, deletedAt: null } });
  if (!team) throw new AppError(404, 'Not Found', 'Team not found');
  const updated = await prisma.team.update({ where: { id: teamId }, data: { name } });
  await recordAudit({ entityType: 'team', entityId: teamId, action: 'updated', actorId, diff: { name } });
  return updated;
}

export async function deleteTeam(orgId: string, teamId: string, actorId: string) {
  const team = await prisma.team.findFirst({ where: { id: teamId, orgId, deletedAt: null } });
  if (!team) throw new AppError(404, 'Not Found', 'Team not found');
  await prisma.team.update({ where: { id: teamId }, data: { deletedAt: new Date() } });
  await recordAudit({ entityType: 'team', entityId: teamId, action: 'deleted', actorId });
}

export async function addTeamMember(orgId: string, teamId: string, userId: string, actorId: string) {
  const team = await prisma.team.findFirst({ where: { id: teamId, orgId, deletedAt: null } });
  if (!team) throw new AppError(404, 'Not Found', 'Team not found');

  const user = await prisma.user.findFirst({ where: { id: userId, orgId, deletedAt: null } });
  if (!user) throw new AppError(404, 'Not Found', 'User not found in org');

  const member = await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId, userId } },
    create: { teamId, userId },
    update: {},
  });
  await recordAudit({ entityType: 'team', entityId: teamId, action: 'member_added', actorId, diff: { userId } });
  return member;
}

export async function removeTeamMember(orgId: string, teamId: string, userId: string, actorId: string) {
  const team = await prisma.team.findFirst({ where: { id: teamId, orgId, deletedAt: null } });
  if (!team) throw new AppError(404, 'Not Found', 'Team not found');

  const member = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
  if (!member) throw new AppError(404, 'Not Found', 'Member not in team');

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  await recordAudit({ entityType: 'team', entityId: teamId, action: 'member_removed', actorId, diff: { userId } });
}
