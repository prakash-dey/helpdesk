import { Worker, Job } from 'bullmq';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import { redisConnection } from '@/config/redis';
import { transporter } from '@/config/mail';
import { env } from '@/config/env';
import { prisma } from '@/config/prisma';
import { logger } from '@/utils/logger';

function loadTemplate(name: string): HandlebarsTemplateDelegate {
  const filePath = path.join(__dirname, '../templates', `${name}.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8');
  return Handlebars.compile(source);
}

async function sendAcknowledgement(job: Job): Promise<void> {
  const { ticketId } = job.data as { ticketId: string };
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { requester: true, org: true },
  });
  if (!ticket) return;

  const template = loadTemplate('ticket-acknowledgement');
  const html = template({
    userName: ticket.requester.name,
    ticketId: ticket.id.slice(0, 8).toUpperCase(),
    subject: ticket.subject,
    portalUrl: `${env.CLIENT_URL}/tickets/${ticket.id}`,
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: ticket.requester.email,
    subject: `[#${ticket.id.slice(0, 8).toUpperCase()}] We received your request: ${ticket.subject}`,
    html,
  });
}

async function sendCommentNotification(job: Job): Promise<void> {
  const { ticketId, commentId } = job.data as { ticketId: string; commentId: string };
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { ticket: { include: { requester: true } }, author: true },
  });
  if (!comment || comment.isInternal) return;

  const template = loadTemplate('comment-notification');
  const html = template({
    userName: comment.ticket.requester.name,
    agentName: comment.author.name,
    ticketSubject: comment.ticket.subject,
    commentBody: comment.body,
    portalUrl: `${env.CLIENT_URL}/tickets/${ticketId}`,
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: comment.ticket.requester.email,
    subject: `Re: [#${ticketId.slice(0, 8).toUpperCase()}] ${comment.ticket.subject}`,
    html,
  });
}

async function sendInvitation(job: Job): Promise<void> {
  const { to, orgName, token, expiresAt } = job.data as {
    to: string; orgName: string; token: string; expiresAt: string;
  };

  const template = loadTemplate('invitation');
  const html = template({
    orgName,
    acceptUrl: `${env.CLIENT_URL}/auth/accept-invite?token=${token}`,
    expiresAt: new Date(expiresAt).toLocaleDateString(),
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: `You've been invited to join ${orgName} on SupportDesk Pro`,
    html,
  });
}

async function sendCsatSurvey(job: Job): Promise<void> {
  const { ticketId } = job.data as { ticketId: string };
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { requester: true },
  });
  if (!ticket) return;

  const survey = await prisma.csatSurvey.create({ data: { ticketId } });

  const template = loadTemplate('csat-survey');
  const html = template({
    userName: ticket.requester.name,
    ticketSubject: ticket.subject,
    surveyUrl: `${env.CLIENT_URL}/csat/${survey.id}`,
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: ticket.requester.email,
    subject: `How did we do? - ${ticket.subject}`,
    html,
  });
}

export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    switch (job.name) {
      case 'send-acknowledgement': await sendAcknowledgement(job); break;
      case 'send-comment-notification': await sendCommentNotification(job); break;
      case 'send-invitation': await sendInvitation(job); break;
      case 'send-csat': await sendCsatSurvey(job); break;
      default: logger.warn(`Unknown email job: ${job.name}`);
    }
  },
  {
    connection: redisConnection.connection,
    concurrency: 5,
  },
);

emailWorker.on('failed', (job, err) => {
  logger.error('Email job failed', { jobId: job?.id, jobName: job?.name, err: err.message });
});
