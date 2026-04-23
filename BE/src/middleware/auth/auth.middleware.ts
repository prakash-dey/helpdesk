import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { redis } from '@/config/redis';
import { AppError } from '@/middleware/errorHandler';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  orgId?: string;
  jti: string;
  iat: number;
  exp: number;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError(401, 'Unauthorized', 'Missing or invalid Authorization header'));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const isBlocked = await redis.get(`blocklist:${payload.jti}`);
    if (isBlocked) {
      next(new AppError(401, 'Unauthorized', 'Token has been revoked'));
      return;
    }

    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    req.orgId = payload.orgId;
    next();
  } catch {
    next(new AppError(401, 'Unauthorized', 'Invalid or expired token'));
  }
}
