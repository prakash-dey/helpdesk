import { Request, Response } from 'express';
import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';
import * as kbService from './kb.service';

export async function listCategories(req: Request, res: Response): Promise<void> {
  const categories = await kbService.listCategories(req.params.orgId);
  res.json({ data: categories });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const { name, parentId } = z.object({ name: z.string().min(1), parentId: z.string().uuid().optional() }).parse(req.body);
  const cat = await kbService.createCategory(req.params.orgId, name, parentId, req.userId);
  res.status(201).json({ data: cat });
}

export async function listArticles(req: Request, res: Response): Promise<void> {
  const status = req.query.status as ArticleStatus | undefined;
  const categoryId = req.query.categoryId as string | undefined;
  const articles = await kbService.listArticles(req.params.orgId, status, categoryId);
  res.json({ data: articles });
}

export async function searchArticles(req: Request, res: Response): Promise<void> {
  const { q } = z.object({ q: z.string().min(1) }).parse(req.query);
  const articles = await kbService.searchArticles(req.params.orgId, q as string);
  res.json({ data: articles });
}

export async function getArticle(req: Request, res: Response): Promise<void> {
  const article = await kbService.getArticle(req.params.orgId, req.params.articleId, req.userId);
  res.json({ data: article });
}

export async function createArticle(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().min(1).max(255),
    body: z.string().min(1),
    categoryId: z.string().uuid().optional(),
    status: z.nativeEnum(ArticleStatus).optional(),
  });
  const data = schema.parse(req.body);
  const article = await kbService.createArticle(req.params.orgId, req.userId!, data);
  res.status(201).json({ data: article });
}

export async function updateArticle(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().optional(),
    body: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    status: z.nativeEnum(ArticleStatus).optional(),
  });
  const data = schema.parse(req.body);
  const article = await kbService.updateArticle(req.params.orgId, req.params.articleId, req.userId!, data);
  res.json({ data: article });
}

export async function deleteArticle(req: Request, res: Response): Promise<void> {
  await kbService.deleteArticle(req.params.orgId, req.params.articleId, req.userId!);
  res.status(204).end();
}
