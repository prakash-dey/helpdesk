import { Worker, Job } from 'bullmq';
import { TicketStatus } from '@prisma/client';
import { redisConnection } from '@/config/redis';
import { prisma } from '@/config/prisma';
import { recordAudit } from '@/utils/auditLog';
import { logger } from '@/utils/logger';
import { getIo } from '@/socket/socket';

async function checkSlaBreach(job: Job): Promise<void> {
  const { ticketId } = job.data as { ticketId: string };

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;

  // Skip if already resolved
  const resolvedStatuses: string[] = [TicketStatus.SOLVED, TicketStatus.CLOSED];
  if (resolvedStatuses.includes(ticket.status)) return;

  logger.warn('SLA breach detected', { ticketId });

  await recordAudit({
    entityType: 'ticket',
    entityId: ticketId,
    action: 'sla_breached',
    diff: { status: ticket.status, breachedAt: new Date() },
  });

  // Broadcast via WebSocket to org room
  const io = getIo();
  if (io) {
    io.to(`org:${ticket.orgId}`).emit('sla.breach', { ticketId, subject: ticket.subject });
  }
}

export const slaWorker = new Worker(
  'sla',
  async (job: Job) => {
    if (job.name === 'check-sla-breach') await checkSlaBreach(job);
  },
  { connection: redisConnection.connection },
);

slaWorker.on('failed', (job, err) => {
  logger.error('SLA job failed', { jobId: job?.id, err: err.message });
});
