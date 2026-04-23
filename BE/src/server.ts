import 'dotenv/config';
import http from 'http';
import app from './app';
import { env } from '@/config/env';
import { prisma } from '@/config/prisma';
import { redis } from '@/config/redis';
import { initSocket } from '@/socket/socket';
import { logger } from '@/utils/logger';

// Import workers to register them
import '@/jobs/email.worker';
import '@/jobs/sla.worker';
import '@/jobs/webhook.worker';
import { startImapPoller } from '@/jobs/imap.worker';

async function main(): Promise<void> {
  // Verify DB connection
  await prisma.$connect();
  logger.info('Database connected');

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      port: env.PORT,
    });
  });

  startImapPoller();

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    await prisma.$disconnect();
    redis.disconnect();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Failed to start server', { err: (err as Error).message });
  process.exit(1);
});
