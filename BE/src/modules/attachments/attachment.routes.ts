import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import * as ctrl from './attachment.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, asyncHandler(ctrl.listAttachments));
router.post('/presign', requireAuth, asyncHandler(ctrl.presignUpload));
router.get('/:attachmentId/download', requireAuth, asyncHandler(ctrl.getDownloadUrl));
router.delete('/:attachmentId', requireAuth, asyncHandler(ctrl.deleteAttachment));

export default router;
