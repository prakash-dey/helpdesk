import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { TicketChannel, TicketPriority, TicketStatus } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/config/prisma';
import { emailQueue, slaQueue } from '@/jobs/queues';
import { logger } from '@/utils/logger';

async function processEmail(mail: ParsedMail): Promise<void> {
  const from = Array.isArray(mail.from?.value) ? mail.from!.value[0] : mail.from?.value;
  if (!from?.address) return;

  const subject = mail.subject ?? '(No Subject)';
  const text = mail.text ?? mail.html ?? '';

  // Find or create user by email
  let user = await prisma.user.findUnique({ where: { email: from.address.toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: from.address.toLowerCase(),
        name: from.name ?? from.address,
        role: 'CUSTOMER',
      },
    });
  }

  // Find org by email domain (or use default)
  const domain = from.address.split('@')[1];
  const org = await prisma.organization.findFirst({ where: { domain } });
  if (!org) {
    logger.warn('No org found for inbound email domain', { domain });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      orgId: org.id,
      requesterId: user.id,
      subject: subject.slice(0, 255),
      description: typeof text === 'string' ? text.trim() : '',
      status: TicketStatus.NEW,
      priority: TicketPriority.MEDIUM,
      channel: TicketChannel.EMAIL,
    },
  });

  await emailQueue.add('send-acknowledgement', { ticketId: ticket.id });
  logger.info('Ticket created from email', { ticketId: ticket.id, from: from.address });
}

export function startImapPoller(): void {
  if (!env.IMAP_HOST || env.IMAP_HOST === 'localhost') {
    logger.info('IMAP polling disabled (no host configured)');
    return;
  }

  const imap = new Imap({
    user: env.IMAP_USER,
    password: env.IMAP_PASS,
    host: env.IMAP_HOST,
    port: env.IMAP_PORT,
    tls: env.IMAP_TLS,
  });

  function openInbox(cb: (err: Error | null, box: Imap.Box) => void): void {
    imap.openBox(env.IMAP_MAILBOX, false, cb);
  }

  imap.once('ready', () => {
    openInbox((err) => {
      if (err) { logger.error('IMAP open box error', { err: err.message }); return; }

      imap.search(['UNSEEN'], (searchErr, results) => {
        if (searchErr || !results.length) { imap.end(); return; }

        const fetch = imap.fetch(results, { bodies: '' });
        fetch.on('message', (msg) => {
          const chunks: Buffer[] = [];
          msg.on('body', (stream) => stream.on('data', (chunk: Buffer) => chunks.push(chunk)));
          msg.once('end', async () => {
            try {
              const mail = await simpleParser(Buffer.concat(chunks));
              await processEmail(mail);
            } catch (e) {
              logger.error('Failed to process email', { err: (e as Error).message });
            }
          });
        });

        fetch.once('end', () => { imap.end(); });
      });
    });
  });

  imap.once('error', (err: Error) => logger.error('IMAP error', { err: err.message }));

  // Poll every 60 seconds
  setInterval(() => { imap.connect(); }, 60 * 1000);
  imap.connect();
}
