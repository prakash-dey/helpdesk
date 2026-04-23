import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './csat.controller';

const csatRouter = Router();
csatRouter.get('/:surveyId', asyncHandler(ctrl.getSurvey));
csatRouter.post('/:surveyId/submit', asyncHandler(ctrl.submitSurvey));

const orgCsatRouter = Router({ mergeParams: true });
orgCsatRouter.get('/', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.listSurveys));

export { csatRouter, orgCsatRouter };
