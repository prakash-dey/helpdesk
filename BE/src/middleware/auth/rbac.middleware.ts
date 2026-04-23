import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '@/middleware/errorHandler';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 5,
  [UserRole.TEAM_LEAD]: 4,
  [UserRole.AGENT]: 3,
  [UserRole.VIEWER]: 2,
  [UserRole.CUSTOMER]: 1,
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      next(new AppError(401, 'Unauthorized', 'Not authenticated'));
      return;
    }

    if (!roles.includes(req.userRole as UserRole)) {
      next(new AppError(403, 'Forbidden', 'Insufficient permissions'));
      return;
    }

    next();
  };
}

export function requireMinRole(minRole: UserRole): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      next(new AppError(401, 'Unauthorized', 'Not authenticated'));
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.userRole as UserRole] ?? 0;
    const minLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < minLevel) {
      next(new AppError(403, 'Forbidden', 'Insufficient permissions'));
      return;
    }

    next();
  };
}

export function isAdmin(role?: string): boolean {
  return role === UserRole.ADMIN;
}

export function isAgentOrAbove(role?: string): boolean {
  const level = ROLE_HIERARCHY[role as UserRole] ?? 0;
  return level >= ROLE_HIERARCHY[UserRole.AGENT];
}
