import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { requireAuth } from '@/middleware/auth/auth.middleware';
import { requireMinRole, requireRole } from '@/middleware/auth/rbac.middleware';
import { UserRole } from '@prisma/client';
import * as ctrl from './ticket.controller';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, asyncHandler(ctrl.createTicket));
router.get('/', requireAuth, asyncHandler(ctrl.listTickets));
router.get('/:ticketId', requireAuth, asyncHandler(ctrl.getTicket));
router.patch('/:ticketId', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.updateTicket));
router.delete('/:ticketId', requireAuth, requireRole(UserRole.ADMIN), asyncHandler(ctrl.deleteTicket));
router.patch('/:ticketId/status', requireAuth, asyncHandler(ctrl.updateTicketStatus));
router.patch('/:ticketId/assign', requireAuth, requireMinRole(UserRole.AGENT), asyncHandler(ctrl.assignTicket));

export default router;
