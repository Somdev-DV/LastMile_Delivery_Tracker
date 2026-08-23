import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const isProd = env.NODE_ENV === 'production';

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    });
    return;
  }

  // Explicit AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Prisma Client Database errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Resource already exists (duplicate key).' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Resource not found in database.' });
      return;
    }
    res.status(400).json({ success: false, message: `Database error (${err.code}): ${err.message}` });
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('[Prisma Initialization Error]:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure PostgreSQL is running and DATABASE_URL in .env is correct.',
    });
    return;
  }

  // Common Business logic error messages
  if (err?.message) {
    const msg = err.message;
    if (
      msg.includes('Invalid email or password') ||
      msg.includes('not authorized') ||
      msg.includes('deactivated') ||
      msg.includes('JWT')
    ) {
      res.status(401).json({ success: false, message: msg });
      return;
    }

    if (
      msg.includes('not found') ||
      msg.includes('already exists') ||
      msg.includes('pincode') ||
      msg.includes('rate card') ||
      msg.includes('zone') ||
      msg.includes('transition') ||
      msg.includes('weight')
    ) {
      res.status(400).json({ success: false, message: msg });
      return;
    }
  }

  // Generic fallback with logging
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    message: err?.message || 'Internal server error',
    ...(isProd ? {} : { stack: err?.stack }),
  });
}
