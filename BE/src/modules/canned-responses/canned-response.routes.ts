import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './canned-response.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.list));
router.post('/', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.create));
router.patch('/:id', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.remove));

export default router;
