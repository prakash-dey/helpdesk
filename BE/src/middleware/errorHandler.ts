import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public detail?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    type: 'https://httpstatuses.io/404',
    title: 'Not Found',
    status: 404,
    detail: `Route ${req.method} ${req.path} not found`,
    instance: req.path,
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      type: 'https://httpstatuses.io/422',
      title: 'Validation Error',
      status: 422,
      detail: 'Request validation failed',
      errors: err.flatten().fieldErrors,
      instance: req.path,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      type: `https://httpstatuses.io/${err.statusCode}`,
      title: err.message,
      status: err.statusCode,
      detail: err.detail,
      instance: req.path,
    });
    return;
  }

  logger.error('Unhandled error', {
    err: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    type: 'https://httpstatuses.io/500',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    instance: req.path,
  });
}
