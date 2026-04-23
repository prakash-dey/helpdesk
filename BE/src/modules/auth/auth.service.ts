import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { redis } from '@/config/redis';
import { env } from '@/config/env';
import { hashPassword, verifyPassword, sha256Hex } from '@/utils/crypto';
import { AppError } from '@/middleware/errorHandler';
import { JwtPayload } from '@/middleware/auth/auth.middleware';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

function buildTokenPayload(user: {
  id: string;
  email: string;
  role: UserRole;
  orgId: string | null;
}): Omit<JwtPayload, 'iat' | 'exp'> {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    orgId: user.orgId ?? undefined,
    jti: uuidv4(),
  };
}

export async function register(
  email: string,
  password: string,
  name: string,
  orgName?: string,
): Promise<TokenPair> {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new AppError(409, 'Conflict', 'Email already in use');

  const passwordHash = await hashPassword(password);

  let orgId: string | null = null;

  if (orgName) {
    const org = await prisma.organization.create({ data: { name: orgName } });
    orgId = org.id;
  }

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: orgName ? UserRole.ADMIN : UserRole.CUSTOMER,
      orgId,
    },
  });

  if (orgId) {
    await prisma.membership.create({
      data: { userId: user.id, orgId, roles: [UserRole.ADMIN] },
    });
  }

  const payload = buildTokenPayload(user);
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, jti: uuidv4() }),
  };
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.passwordHash) {
    throw new AppError(401, 'Unauthorized', 'Invalid email or password');
  }

  if (user.deletedAt) throw new AppError(401, 'Unauthorized', 'Account deactivated');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Unauthorized', 'Invalid email or password');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const payload = buildTokenPayload(user);
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, jti: uuidv4() }),
  };
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError(401, 'Unauthorized', 'Invalid or expired refresh token');
  }

  const isBlocked = await redis.get(`blocklist:${payload.jti}`);
  if (isBlocked) throw new AppError(401, 'Unauthorized', 'Refresh token revoked');

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.deletedAt) throw new AppError(401, 'Unauthorized', 'User not found');

  // Rotate: block old refresh token
  const ttl = payload.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.setex(`blocklist:${payload.jti}`, ttl, '1');

  const newPayload = buildTokenPayload(user);
  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken({ ...newPayload, jti: uuidv4() }),
  };
}

export async function logout(jti: string, exp: number): Promise<void> {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.setex(`blocklist:${jti}`, ttl, '1');
}

export async function acceptInvitation(
  token: string,
  name: string,
  password: string,
): Promise<TokenPair> {
  const tokenHash = sha256Hex(token);
  const invitation = await prisma.invitation.findUnique({ where: { tokenHash } });

  if (!invitation) throw new AppError(404, 'Not Found', 'Invitation not found');
  if (invitation.status !== 'PENDING') throw new AppError(400, 'Bad Request', 'Invitation already used');
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
    throw new AppError(400, 'Bad Request', 'Invitation has expired');
  }

  const passwordHash = await hashPassword(password);

  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  let user;
  if (existingUser) {
    user = existingUser;
  } else {
    user = await prisma.user.create({
      data: {
        email: invitation.email,
        name,
        passwordHash,
        role: invitation.rolesToGrant[0] ?? UserRole.AGENT,
        orgId: invitation.orgId,
      },
    });
  }

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: invitation.orgId } },
    create: { userId: user.id, orgId: invitation.orgId, roles: invitation.rolesToGrant },
    update: { roles: invitation.rolesToGrant },
  });

  await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'ACCEPTED' } });

  const payload = buildTokenPayload({ ...user, orgId: invitation.orgId });
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, jti: uuidv4() }),
  };
}
