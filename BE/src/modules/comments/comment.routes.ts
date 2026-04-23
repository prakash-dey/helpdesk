import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import * as ctrl from './comment.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, asyncHandler(ctrl.listComments));
router.post('/', requireAuth, asyncHandler(ctrl.createComment));
router.patch('/:commentId', requireAuth, asyncHandler(ctrl.updateComment));
router.delete('/:commentId', requireAuth, asyncHandler(ctrl.deleteComment));

export default router;
