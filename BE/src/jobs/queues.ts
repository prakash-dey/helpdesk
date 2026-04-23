import { Queue } from 'bullmq';
import { redisConnection } from '@/config/redis';

export const emailQueue = new Queue('email', { connection: redisConnection.connection });
export const slaQueue = new Queue('sla', { connection: redisConnection.connection });
export const webhookQueue = new Queue('webhook', { connection: redisConnection.connection });
export const imapQueue = new Queue('imap', { connection: redisConnection.connection });
