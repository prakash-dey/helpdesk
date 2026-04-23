import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '4000'), 10),
  API_BASE_URL: optional('API_BASE_URL', 'http://localhost:4000'),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:5173'),

  DATABASE_URL: required('DATABASE_URL'),
  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  AWS_REGION: optional('AWS_REGION', 'us-east-1'),
  AWS_ACCESS_KEY_ID: optional('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: optional('AWS_SECRET_ACCESS_KEY', ''),
  AWS_S3_BUCKET: optional('AWS_S3_BUCKET', 'supportdesk-attachments'),

  SMTP_HOST: optional('SMTP_HOST', 'localhost'),
  SMTP_PORT: parseInt(optional('SMTP_PORT', '1025'), 10),
  SMTP_SECURE: optional('SMTP_SECURE', 'false') === 'true',
  SMTP_USER: optional('SMTP_USER', ''),
  SMTP_PASS: optional('SMTP_PASS', ''),
  SMTP_FROM: optional('SMTP_FROM', 'SupportDesk Pro <noreply@supportdesk.dev>'),

  IMAP_HOST: optional('IMAP_HOST', 'localhost'),
  IMAP_PORT: parseInt(optional('IMAP_PORT', '993'), 10),
  IMAP_USER: optional('IMAP_USER', ''),
  IMAP_PASS: optional('IMAP_PASS', ''),
  IMAP_TLS: optional('IMAP_TLS', 'true') === 'true',
  IMAP_MAILBOX: optional('IMAP_MAILBOX', 'INBOX'),

  isDev: () => (process.env.NODE_ENV ?? 'development') === 'development',
  isProd: () => process.env.NODE_ENV === 'production',
};
