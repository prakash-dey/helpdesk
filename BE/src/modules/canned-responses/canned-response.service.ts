import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';

export async function listCannedResponses(orgId: string, teamId?: string, search?: string) {
  return prisma.cannedResponse.findMany({
    where: {
      orgId,
      teamId: teamId ?? undefined,
      title: search ? { contains: search, mode: 'insensitive' } : undefined,
    },
    include: { team: { select: { id: true, name: true } } },
    orderBy: { title: 'asc' },
  });
}

export async function createCannedResponse(orgId: string, createdById: string, data: { title: string; body: string; teamId?: string }) {
  return prisma.cannedResponse.create({ data: { ...data, orgId, createdById } });
}

export async function updateCannedResponse(orgId: string, id: string, data: { title?: string; body?: string; teamId?: string }) {
  const response = await prisma.cannedResponse.findFirst({ where: { id, orgId } });
  if (!response) throw new AppError(404, 'Not Found', 'Canned response not found');
  return prisma.cannedResponse.update({ where: { id }, data });
}

export async function deleteCannedResponse(orgId: string, id: string) {
  const response = await prisma.cannedResponse.findFirst({ where: { id, orgId } });
  if (!response) throw new AppError(404, 'Not Found', 'Canned response not found');
  await prisma.cannedResponse.delete({ where: { id } });
}
