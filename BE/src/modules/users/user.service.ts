import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';

export async function getUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, name: true, role: true, orgId: true, lastLoginAt: true, createdAt: true },
  });
  if (!user) throw new AppError(404, 'Not Found', 'User not found');
  return user;
}

export async function updateProfile(userId: string, data: { name?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, role: true, orgId: true, updatedAt: true },
  });
}

export async function listOrgUsers(orgId: string) {
  return prisma.user.findMany({
    where: { orgId, deletedAt: null },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
}

export async function deactivateUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
}
