import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1).max(100),
    orgName: z.string().min(1).max(100).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
    name: z.string().min(1).max(100),
  }),
});
