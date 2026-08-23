import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/response';

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Forbidden: insufficient permissions', 403);
      return;
    }
    next();
  };
}
