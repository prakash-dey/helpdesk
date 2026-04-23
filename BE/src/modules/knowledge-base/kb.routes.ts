import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole, requireRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './kb.controller';

const router = Router({ mergeParams: true });

router.get('/categories', asyncHandler(ctrl.listCategories));
router.post('/categories', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.createCategory));

router.get('/articles', asyncHandler(ctrl.listArticles));
router.get('/articles/search', asyncHandler(ctrl.searchArticles));
router.post('/articles', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.createArticle));
router.get('/articles/:articleId', asyncHandler(ctrl.getArticle));
router.patch('/articles/:articleId', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.updateArticle));
router.delete('/articles/:articleId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.deleteArticle));

export default router;
