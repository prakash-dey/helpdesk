import { TicketPriority } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { recordAudit } from '@/utils/auditLog';

export async function listSlaPolicies(orgId: string) {
  return prisma.slaPolicy.findMany({
    where: { orgId },
    orderBy: { priority: 'asc' },
  });
}

export async function createSlaPolicy(
  orgId: string,
  actorId: string,
  data: {
    name: string;
    priority: TicketPriority;
    firstResponseMinutes: number;
    resolutionMinutes: number;
  },
) {
  const policy = await prisma.slaPolicy.create({ data: { ...data, orgId } });
  await recordAudit({ entityType: 'sla_policy', entityId: policy.id, action: 'created', actorId });
  return policy;
}

export async function updateSlaPolicy(
  orgId: string,
  policyId: string,
  actorId: string,
  data: {
    name?: string;
    firstResponseMinutes?: number;
    resolutionMinutes?: number;
  },
) {
  const policy = await prisma.slaPolicy.findFirst({ where: { id: policyId, orgId } });
  if (!policy) throw new AppError(404, 'Not Found', 'SLA policy not found');

  const updated = await prisma.slaPolicy.update({ where: { id: policyId }, data });
  await recordAudit({ entityType: 'sla_policy', entityId: policyId, action: 'updated', actorId, diff: data as Record<string, unknown> });
  return updated;
}

export async function deleteSlaPolicy(orgId: string, policyId: string, actorId: string) {
  const policy = await prisma.slaPolicy.findFirst({ where: { id: policyId, orgId } });
  if (!policy) throw new AppError(404, 'Not Found', 'SLA policy not found');

  await prisma.slaPolicy.delete({ where: { id: policyId } });
  await recordAudit({ entityType: 'sla_policy', entityId: policyId, action: 'deleted', actorId });
}

export async function setDefaultSlaPolicy(orgId: string, policyId: string, actorId: string) {
  const policy = await prisma.slaPolicy.findFirst({ where: { id: policyId, orgId } });
  if (!policy) throw new AppError(404, 'Not Found', 'SLA policy not found');

  await prisma.organization.update({ where: { id: orgId }, data: { defaultSlaPolicyId: policyId } });
  await recordAudit({ entityType: 'organization', entityId: orgId, action: 'default_sla_set', actorId, diff: { policyId } });
}
