import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole, requireRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './organization.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, asyncHandler(ctrl.getOrg));
router.patch('/', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.updateOrg));

router.get('/members', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.getMembers));
router.patch('/members/:userId/roles', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.updateMemberRoles));
router.delete('/members/:userId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.removeMember));

router.get('/invitations', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.listInvitations));
router.post('/invitations', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.createInvitation));
router.delete('/invitations/:invitationId', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.revokeInvitation));

export default router;
