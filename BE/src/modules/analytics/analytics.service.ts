import { prisma } from '@/config/prisma';

export async function getTicketStats(orgId: string, from: Date, to: Date) {
  const [total, byStatus, byPriority, avgResolutionMs] = await Promise.all([
    prisma.ticket.count({ where: { orgId, createdAt: { gte: from, lte: to }, deletedAt: null } }),
    prisma.ticket.groupBy({
      by: ['status'],
      where: { orgId, createdAt: { gte: from, lte: to }, deletedAt: null },
      _count: { id: true },
    }),
    prisma.ticket.groupBy({
      by: ['priority'],
      where: { orgId, createdAt: { gte: from, lte: to }, deletedAt: null },
      _count: { id: true },
    }),
    prisma.$queryRaw<[{ avg_ms: bigint | null }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000)::bigint AS avg_ms
      FROM tickets
      WHERE org_id = ${orgId}
        AND status IN ('SOLVED','CLOSED')
        AND created_at >= ${from}
        AND created_at <= ${to}
        AND deleted_at IS NULL
    `,
  ]);

  return {
    total,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
    byPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p._count.id])),
    avgResolutionMs: avgResolutionMs[0]?.avg_ms ? Number(avgResolutionMs[0].avg_ms) : null,
  };
}

export async function getSlaBreach(orgId: string, from: Date, to: Date) {
  const [total, breached] = await Promise.all([
    prisma.ticket.count({ where: { orgId, createdAt: { gte: from, lte: to }, deletedAt: null } }),
    prisma.ticket.count({
      where: {
        orgId,
        createdAt: { gte: from, lte: to },
        deletedAt: null,
        slaBreachAt: { lte: new Date() },
        status: { notIn: ['SOLVED', 'CLOSED'] },
      },
    }),
  ]);
  return { total, breached, rate: total > 0 ? Math.round((breached / total) * 100) : 0 };
}

export async function getCsatStats(orgId: string, from: Date, to: Date) {
  const surveys = await prisma.csatSurvey.findMany({
    where: {
      ticket: { orgId },
      submittedAt: { gte: from, lte: to },
      score: { not: null },
    },
    select: { score: true },
  });

  if (!surveys.length) return { count: 0, average: null, distribution: {} };

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const s of surveys) {
    if (s.score !== null) {
      distribution[s.score] = (distribution[s.score] ?? 0) + 1;
      sum += s.score;
    }
  }

  return { count: surveys.length, average: Math.round((sum / surveys.length) * 10) / 10, distribution };
}

export async function getAgentStats(orgId: string, from: Date, to: Date) {
  return prisma.$queryRaw<Array<{ agent_id: string; name: string; resolved: bigint; avg_ms: bigint | null }>>`
    SELECT u.id AS agent_id, u.name,
      COUNT(t.id) AS resolved,
      AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) * 1000)::bigint AS avg_ms
    FROM tickets t
    JOIN users u ON u.id = t.assignee_id
    WHERE t.org_id = ${orgId}
      AND t.status IN ('SOLVED','CLOSED')
      AND t.created_at >= ${from}
      AND t.created_at <= ${to}
      AND t.deleted_at IS NULL
    GROUP BY u.id, u.name
    ORDER BY resolved DESC
    LIMIT 20
  `;
}

export async function getAuditLog(orgId: string, entityType?: string, cursor?: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(cursor ? { id: { gt: cursor } } : {}),
    },
    take: limit,
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
