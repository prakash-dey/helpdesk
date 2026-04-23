import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import orgRoutes from '@/modules/organizations/organization.routes';
import userRoutes from '@/modules/users/user.routes';
import teamRoutes from '@/modules/teams/team.routes';
import ticketRoutes from '@/modules/tickets/ticket.routes';
import commentRoutes from '@/modules/comments/comment.routes';
import attachmentRoutes from '@/modules/attachments/attachment.routes';
import slaRoutes from '@/modules/sla/sla.routes';
import kbRoutes from '@/modules/knowledge-base/kb.routes';
import { csatRouter, orgCsatRouter } from '@/modules/csat/csat.routes';
import webhookRoutes from '@/modules/webhooks/webhook.routes';
import cannedResponseRoutes from '@/modules/canned-responses/canned-response.routes';
import analyticsRoutes from '@/modules/analytics/analytics.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

router.use('/auth', authRoutes);

// CSAT (public — no org prefix needed)
router.use('/csat', csatRouter);

// Org-scoped routes
router.use('/orgs/:orgId', orgRoutes);
router.use('/orgs/:orgId/users', userRoutes);
router.use('/orgs/:orgId/teams', teamRoutes);
router.use('/orgs/:orgId/tickets', ticketRoutes);
router.use('/orgs/:orgId/tickets/:ticketId/comments', commentRoutes);
router.use('/orgs/:orgId/tickets/:ticketId/attachments', attachmentRoutes);
router.use('/orgs/:orgId/sla-policies', slaRoutes);
router.use('/orgs/:orgId/kb', kbRoutes);
router.use('/orgs/:orgId/csat', orgCsatRouter);
router.use('/orgs/:orgId/webhooks', webhookRoutes);
router.use('/orgs/:orgId/canned-responses', cannedResponseRoutes);
router.use('/orgs/:orgId/analytics', analyticsRoutes);

export default router;
