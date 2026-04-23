import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { sha256Hex, randomToken } from '@/utils/crypto';
import { recordAudit } from '@/utils/auditLog';
import { emailQueue } from '@/jobs/queues';

export async function getOrg(orgId: string) {
  const org = await prisma.organization.findFirst({
    where: { id: orgId, deletedAt: null },
    include: { defaultSlaPolicy: true },
  });
  if (!org) throw new AppError(404, 'Not Found', 'Organization not found');
  return org;
}

export async function updateOrg(
  orgId: string,
  actorId: string,
  data: { name?: string; domain?: string; planTier?: string },
) {
  const org = await prisma.organization.update({
    where: { id: orgId },
    data,
  });
  await recordAudit({ entityType: 'organization', entityId: orgId, action: 'updated', actorId, diff: data as Record<string, unknown> });
  return org;
}

export async function getMembers(orgId: string) {
  return prisma.membership.findMany({
    where: { orgId },
    include: { user: { select: { id: true, email: true, name: true, role: true, createdAt: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateMemberRoles(
  orgId: string,
  targetUserId: string,
  roles: UserRole[],
  actorId: string,
) {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: targetUserId, orgId } },
  });
  if (!membership) throw new AppError(404, 'Not Found', 'Member not found');

  const updated = await prisma.membership.update({
    where: { userId_orgId: { userId: targetUserId, orgId } },
    data: { roles },
  });
  await recordAudit({ entityType: 'membership', entityId: membership.id, action: 'roles_updated', actorId, diff: { roles } });
  return updated;
}

export async function removeMember(orgId: string, targetUserId: string, actorId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: targetUserId, orgId } },
  });
  if (!membership) throw new AppError(404, 'Not Found', 'Member not found');

  await prisma.membership.delete({ where: { userId_orgId: { userId: targetUserId, orgId } } });
  await recordAudit({ entityType: 'membership', entityId: membership.id, action: 'removed', actorId });
}

export async function createInvitation(
  orgId: string,
  invitedByUserId: string,
  email: string,
  rolesToGrant: UserRole[],
) {
  const token = randomToken(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new AppError(404, 'Not Found', 'Organization not found');

  await prisma.invitation.create({
    data: {
      orgId,
      email: email.toLowerCase().trim(),
      invitedByUserId,
      rolesToGrant,
      tokenHash,
      expiresAt,
      status: 'PENDING',
    },
  });

  await emailQueue.add('send-invitation', {
    to: email,
    orgName: org.name,
    token,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function listInvitations(orgId: string) {
  return prisma.invitation.findMany({
    where: { orgId },
    include: { invitedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInvitation(orgId: string, invitationId: string) {
  const inv = await prisma.invitation.findFirst({ where: { id: invitationId, orgId } });
  if (!inv) throw new AppError(404, 'Not Found', 'Invitation not found');
  await prisma.invitation.update({ where: { id: invitationId }, data: { status: 'EXPIRED' } });
}
