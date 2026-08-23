import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { notificationService } from '../services/notificationService';
import { successResponse } from '../utils/response';
import { Role } from '../types';

export class NotificationController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await notificationService.getUserNotifications(req.user!.userId);
      return successResponse(res, list, 'Notifications retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await prisma.notification.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          order: { select: { id: true, orderNumber: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return successResponse(res, list, 'All notifications retrieved', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
