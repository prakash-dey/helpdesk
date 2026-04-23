import IORedis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { err: err.message }));

export const redisConnection = { connection: redis };
