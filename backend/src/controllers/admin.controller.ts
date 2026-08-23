import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { orderService } from '../services/orderService';
import { prisma } from '../config/database';
import { successResponse } from '../utils/response';
import { Role } from '../types';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardMetrics();
      return successResponse(res, stats, 'Dashboard metrics retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as Role | undefined;
      const users = await adminService.getAllUsers(role);
      return successResponse(res, users, 'Users retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async toggleUserActive(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found.');

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
      });
      return successResponse(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`, 200);
    } catch (err) {
      next(err);
    }
  }

  async getRecentOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const orders = await prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true } },
          pickupZone: { select: { name: true } },
          dropZone: { select: { name: true } },
          assignedAgent: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      });
      return successResponse(res, orders, 'Recent orders retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await prisma.notification.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, role: true } },
          order: { select: { orderNumber: true, status: true } },
        },
      });
      return successResponse(res, { data: notifications, total: notifications.length }, 'Notifications retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async overrideOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, remarks } = req.body;
      const updated = await orderService.updateStatus(
        req.params.id,
        status,
        req.user!.userId,
        Role.ADMIN,
        `Admin Override: ${remarks || 'Status manually updated by admin'}`
      );
      return successResponse(res, updated, 'Order status overridden by Admin', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
