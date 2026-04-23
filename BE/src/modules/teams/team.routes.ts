import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole, requireRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './team.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.listTeams));
router.post('/', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.createTeam));
router.get('/:teamId', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.getTeam));
router.patch('/:teamId', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.updateTeam));
router.delete('/:teamId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.deleteTeam));
router.post('/:teamId/members', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.addTeamMember));
router.delete('/:teamId/members/:userId', requireAuth, requireMinRole(UserRole.TEAM_LEAD), asyncHandler(ctrl.removeTeamMember));

export default router;
