import { Request, Response } from 'express';
import { JwtPayload } from '@/middleware/auth/auth.middleware';
import { loginSchema, registerSchema, acceptInviteSchema } from './auth.schemas';
import * as authService from './auth.service';
import { getClientIp, isLockedOut, lockoutResponse, recordFailedLogin, clearFailedLogins } from '@/middleware/rateLimiter';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd(),
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function register(req: Request, res: Response): Promise<void> {
  const { body } = registerSchema.parse(req);
  const { accessToken, refreshToken } = await authService.register(
    body.email,
    body.password,
    body.name,
    body.orgName,
  );
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ data: { accessToken } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const ip = getClientIp(req);

  if (await isLockedOut(ip)) {
    lockoutResponse(res);
    return;
  }

  const { body } = loginSchema.parse(req);

  try {
    const { accessToken, refreshToken } = await authService.login(body.email, body.password);
    await clearFailedLogins(ip);
    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
    res.json({ data: { accessToken } });
  } catch (err) {
    const locked = await recordFailedLogin(ip);
    if (locked) {
      lockoutResponse(res);
      return;
    }
    throw err;
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token: string | undefined = req.cookies?.refresh_token;
  if (!token) {
    res.status(401).json({ type: 'https://httpstatuses.io/401', title: 'Unauthorized', status: 401, detail: 'No refresh token' });
    return;
  }
  const { accessToken, refreshToken } = await authService.refresh(token);
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
  res.json({ data: { accessToken } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.decode(token) as JwtPayload;
      if (payload?.jti && payload?.exp) {
        await authService.logout(payload.jti, payload.exp);
      }
    } catch {
      // ignore
    }
  }

  const refreshToken: string | undefined = req.cookies?.refresh_token;
  if (refreshToken) {
    try {
      const payload = jwt.decode(refreshToken) as JwtPayload;
      if (payload?.jti && payload?.exp) {
        await authService.logout(payload.jti, payload.exp);
      }
    } catch {
      // ignore
    }
  }

  res.clearCookie('refresh_token', { path: '/' });
  res.json({ data: { message: 'Logged out successfully' } });
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const { body } = acceptInviteSchema.parse(req);
  const { accessToken, refreshToken } = await authService.acceptInvitation(
    body.token,
    body.name,
    body.password,
  );
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ data: { accessToken } });
}

export async function me(req: Request, res: Response): Promise<void> {
  const { prisma } = await import('@/config/prisma');
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, email: true, name: true, role: true, orgId: true,
      lastLoginAt: true, createdAt: true,
    },
  });
  res.json({ data: user });
}
