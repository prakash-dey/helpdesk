import { Request } from 'express';

export interface CursorPage<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export function parsePaginationParams(req: Request): { cursor?: string; limit: number } {
  const limit = Math.min(parseInt(String(req.query.limit ?? '25'), 10), 100);
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  return { cursor, limit };
}

export function buildCursorPage<T extends { id: string }>(
  items: T[],
  limit: number,
): CursorPage<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  return { data, meta: { nextCursor, hasMore, limit } };
}
