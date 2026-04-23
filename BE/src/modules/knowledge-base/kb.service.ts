import { ArticleStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { recordAudit } from '@/utils/auditLog';

export async function listCategories(orgId: string) {
  return prisma.kbCategory.findMany({
    where: { orgId },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(orgId: string, name: string, parentId?: string, actorId?: string) {
  if (parentId) {
    const parent = await prisma.kbCategory.findFirst({ where: { id: parentId, orgId } });
    if (!parent) throw new AppError(404, 'Not Found', 'Parent category not found');
  }
  return prisma.kbCategory.create({ data: { name, orgId, parentId } });
}

export async function listArticles(orgId: string, status?: ArticleStatus, categoryId?: string) {
  return prisma.kbArticle.findMany({
    where: {
      orgId,
      deletedAt: null,
      status: status ?? ArticleStatus.PUBLISHED,
      categoryId: categoryId ?? undefined,
    },
    include: { author: { select: { id: true, name: true } }, category: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function searchArticles(orgId: string, query: string) {
  // PostgreSQL full-text search using raw query
  const articles = await prisma.$queryRaw<Array<{ id: string; title: string; body: string; rank: number }>>`
    SELECT id, title, body,
      ts_rank(to_tsvector('english', title || ' ' || body), plainto_tsquery('english', ${query})) AS rank
    FROM kb_articles
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
      AND status = 'PUBLISHED'
      AND to_tsvector('english', title || ' ' || body) @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `;
  return articles;
}

export async function getArticle(orgId: string, articleId: string, userId?: string) {
  const article = await prisma.kbArticle.findFirst({
    where: { id: articleId, orgId, deletedAt: null },
    include: { author: { select: { id: true, name: true } }, category: true },
  });
  if (!article) throw new AppError(404, 'Not Found', 'Article not found');

  // Record view
  if (userId) {
    await prisma.kbArticleView.create({ data: { articleId, userId } }).catch(() => {});
  }

  return article;
}

export async function createArticle(
  orgId: string,
  authorId: string,
  data: { title: string; body: string; categoryId?: string; status?: ArticleStatus },
) {
  const article = await prisma.kbArticle.create({
    data: { ...data, orgId, authorId, status: data.status ?? ArticleStatus.DRAFT },
  });
  await recordAudit({ entityType: 'kb_article', entityId: article.id, action: 'created', actorId: authorId });
  return article;
}

export async function updateArticle(
  orgId: string,
  articleId: string,
  actorId: string,
  data: { title?: string; body?: string; categoryId?: string; status?: ArticleStatus },
) {
  const article = await prisma.kbArticle.findFirst({ where: { id: articleId, orgId, deletedAt: null } });
  if (!article) throw new AppError(404, 'Not Found', 'Article not found');

  const updated = await prisma.kbArticle.update({ where: { id: articleId }, data });
  await recordAudit({ entityType: 'kb_article', entityId: articleId, action: 'updated', actorId, diff: data as Record<string, unknown> });
  return updated;
}

export async function deleteArticle(orgId: string, articleId: string, actorId: string) {
  const article = await prisma.kbArticle.findFirst({ where: { id: articleId, orgId, deletedAt: null } });
  if (!article) throw new AppError(404, 'Not Found', 'Article not found');
  await prisma.kbArticle.update({ where: { id: articleId }, data: { deletedAt: new Date() } });
  await recordAudit({ entityType: 'kb_article', entityId: articleId, action: 'deleted', actorId });
}
