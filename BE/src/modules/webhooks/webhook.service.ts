import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { randomToken } from '@/utils/crypto';

export async function listWebhooks(orgId: string) {
  return prisma.webhook.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
}

export async function createWebhook(orgId: string, url: string, events: string[]) {
  const secret = randomToken(32);
  return prisma.webhook.create({ data: { orgId, url, events, secret, active: true } });
}

export async function updateWebhook(orgId: string, webhookId: string, data: { url?: string; events?: string[]; active?: boolean }) {
  const webhook = await prisma.webhook.findFirst({ where: { id: webhookId, orgId } });
  if (!webhook) throw new AppError(404, 'Not Found', 'Webhook not found');
  return prisma.webhook.update({ where: { id: webhookId }, data });
}

export async function deleteWebhook(orgId: string, webhookId: string) {
  const webhook = await prisma.webhook.findFirst({ where: { id: webhookId, orgId } });
  if (!webhook) throw new AppError(404, 'Not Found', 'Webhook not found');
  await prisma.webhook.delete({ where: { id: webhookId } });
}

export async function rotateSecret(orgId: string, webhookId: string) {
  const webhook = await prisma.webhook.findFirst({ where: { id: webhookId, orgId } });
  if (!webhook) throw new AppError(404, 'Not Found', 'Webhook not found');
  const secret = randomToken(32);
  return prisma.webhook.update({ where: { id: webhookId }, data: { secret } });
}
