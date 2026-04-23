import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './user.controller';

const router = Router({ mergeParams: true });

router.get('/me', requireAuth, asyncHandler(ctrl.getMe));
router.patch('/me', requireAuth, asyncHandler(ctrl.updateMe));
router.get('/', requireAuth, requireRole(UserRole.ADMIN, UserRole.TEAM_LEAD), asyncHandler(ctrl.listOrgUsers));
router.get('/:userId', requireAuth, asyncHandler(ctrl.getUser));
router.delete('/:userId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.deactivateUser));

export default router;
