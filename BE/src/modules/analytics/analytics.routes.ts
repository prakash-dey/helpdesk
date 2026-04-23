import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './analytics.controller';

const router = Router({ mergeParams: true });

router.get('/tickets', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.getTicketStats));
router.get('/sla', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.getSlaBreach));
router.get('/csat', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.getCsatStats));
router.get('/agents', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.getAgentStats));
router.get('/audit-log', requireAuth, requireMinRole(UserRole.ADMIN), asyncHandler(ctrl.getAuditLog));

export default router;
