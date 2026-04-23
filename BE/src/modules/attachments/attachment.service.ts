import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/config/prisma';
import { s3Client } from '@/config/s3';
import { env } from '@/config/env';
import { AppError } from '@/middleware/errorHandler';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'text/plain',
]);

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function presignUpload(
  orgId: string,
  ticketId: string,
  filename: string,
  mimeType: string,
  sizeBytes: number,
) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError(400, 'Bad Request', `File type ${mimeType} is not allowed`);
  }
  if (sizeBytes > MAX_SIZE_BYTES) {
    throw new AppError(400, 'Bad Request', 'File size exceeds 20MB limit');
  }

  const s3Key = `${orgId}/tickets/${ticketId}/${uuidv4()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: s3Key,
    ContentType: mimeType,
    ContentLength: sizeBytes,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  const attachment = await prisma.attachment.create({
    data: { s3Key, filename, sizeBytes, mimeType, ticketId },
  });

  return { attachment, uploadUrl };
}

export async function getDownloadUrl(attachmentId: string, orgId: string): Promise<string> {
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      OR: [
        { ticket: { orgId } },
        { comment: { ticket: { orgId } } },
      ],
    },
  });
  if (!attachment) throw new AppError(404, 'Not Found', 'Attachment not found');

  const command = new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: attachment.s3Key });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteAttachment(attachmentId: string, orgId: string): Promise<void> {
  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, ticket: { orgId } },
  });
  if (!attachment) throw new AppError(404, 'Not Found', 'Attachment not found');

  await s3Client.send(new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: attachment.s3Key }));
  await prisma.attachment.delete({ where: { id: attachmentId } });
}

export async function listTicketAttachments(orgId: string, ticketId: string) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, orgId, deletedAt: null } });
  if (!ticket) throw new AppError(404, 'Not Found', 'Ticket not found');
  return prisma.attachment.findMany({ where: { ticketId }, orderBy: { createdAt: 'desc' } });
}
