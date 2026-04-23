import rateLimit from 'express-rate-limit';
import { redis } from '@/config/redis';
import { Request, Response } from 'express';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://httpstatuses.io/429',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Rate limit exceeded. Please try again later.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://httpstatuses.io/429',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many auth attempts. Please try again in 15 minutes.',
  },
});

export async function recordFailedLogin(ip: string): Promise<boolean> {
  const key = `login:failures:${ip}`;
  const attempts = await redis.incr(key);
  if (attempts === 1) {
    await redis.expire(key, LOCKOUT_DURATION_SECONDS);
  }
  return attempts >= LOCKOUT_ATTEMPTS;
}

export async function clearFailedLogins(ip: string): Promise<void> {
  await redis.del(`login:failures:${ip}`);
}

export async function isLockedOut(ip: string): Promise<boolean> {
  const attempts = await redis.get(`login:failures:${ip}`);
  return attempts !== null && parseInt(attempts, 10) >= LOCKOUT_ATTEMPTS;
}

export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
    req.socket.remoteAddress ??
    'unknown'
  );
}

export function lockoutResponse(res: Response): void {
  res.status(429).json({
    type: 'https://httpstatuses.io/429',
    title: 'Account Locked',
    status: 429,
    detail: 'Too many failed attempts. Account locked for 15 minutes.',
  });
}
