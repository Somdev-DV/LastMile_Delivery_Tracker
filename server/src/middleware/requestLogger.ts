import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { env } from '../config/env';

const format = env.NODE_ENV === 'production' ? 'combined' : 'dev';

export const requestLogger = morgan(format, {
  skip: (_req: Request, res: Response) =>
    env.NODE_ENV === 'test' || res.statusCode < 400,
});

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
}
