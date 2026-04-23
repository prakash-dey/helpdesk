import { Worker, Job } from 'bullmq';
import { redisConnection } from '@/config/redis';
import { prisma } from '@/config/prisma';
import { hmacSha256 } from '@/utils/crypto';
import { logger } from '@/utils/logger';

async function dispatchWebhook(job: Job): Promise<void> {
  const { event, orgId, payload } = job.data as {
    event: string;
    orgId: string;
    payload: Record<string, unknown>;
  };

  const webhooks = await prisma.webhook.findMany({
    where: { orgId, active: true, events: { has: event } },
  });

  await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
      const signature = hmacSha256(body, webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SupportDesk-Signature': `sha256=${signature}`,
          'X-SupportDesk-Event': event,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status} ${webhook.url}`);
      }
    }),
  );
}

export const webhookWorker = new Worker(
  'webhook',
  async (job: Job) => {
    if (job.name === 'dispatch') await dispatchWebhook(job);
  },
  {
    connection: redisConnection.connection,
    concurrency: 10,
  },
);

webhookWorker.on('failed', (job, err) => {
  logger.error('Webhook job failed', { jobId: job?.id, err: err.message });
});
