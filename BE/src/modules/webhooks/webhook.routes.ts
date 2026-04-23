import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './webhook.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.listWebhooks));
router.post('/', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.createWebhook));
router.patch('/:webhookId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.updateWebhook));
router.delete('/:webhookId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.deleteWebhook));
router.post('/:webhookId/rotate-secret', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.rotateSecret));

export default router;
