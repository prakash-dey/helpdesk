import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireRole, requireMinRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './sla.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.listSlaPolicies));
router.post('/', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.createSlaPolicy));
router.patch('/:policyId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.updateSlaPolicy));
router.delete('/:policyId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.deleteSlaPolicy));
router.post('/set-default', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.setDefaultSlaPolicy));

export default router;
