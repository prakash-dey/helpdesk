import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { authLimiter } from '@/middleware/rateLimiter';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register', authLimiter, asyncHandler(ctrl.register));
router.post('/login', authLimiter, asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/accept-invite', authLimiter, asyncHandler(ctrl.acceptInvite));
router.get('/me', requireAuth, asyncHandler(ctrl.me));

export default router;
