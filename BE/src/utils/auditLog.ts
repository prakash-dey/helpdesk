import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';

interface AuditParams {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  diff?: Record<string, unknown>;
}

export async function recordAudit(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorId: params.actorId,
      diff: params.diff ? (params.diff as Prisma.InputJsonValue) : undefined,
    },
  });
}
