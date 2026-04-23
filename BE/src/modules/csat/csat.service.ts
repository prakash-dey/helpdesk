import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';

export async function getSurvey(surveyId: string) {
  const survey = await prisma.csatSurvey.findUnique({
    where: { id: surveyId },
    include: { ticket: { select: { id: true, subject: true } } },
  });
  if (!survey) throw new AppError(404, 'Not Found', 'Survey not found');
  return survey;
}

export async function submitSurvey(surveyId: string, score: number, comment?: string) {
  const survey = await prisma.csatSurvey.findUnique({ where: { id: surveyId } });
  if (!survey) throw new AppError(404, 'Not Found', 'Survey not found');
  if (survey.submittedAt) throw new AppError(409, 'Conflict', 'Survey already submitted');
  if (score < 1 || score > 5) throw new AppError(400, 'Bad Request', 'Score must be between 1 and 5');

  return prisma.csatSurvey.update({
    where: { id: surveyId },
    data: { score, comment, submittedAt: new Date() },
  });
}

export async function listSurveys(orgId: string) {
  return prisma.csatSurvey.findMany({
    where: { ticket: { orgId } },
    include: { ticket: { select: { id: true, subject: true, requesterId: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
