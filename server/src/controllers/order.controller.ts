import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { rateCalculationService } from '../services/rateCalculationService';
import { assignmentService } from '../services/assignmentService';
import { rescheduleService } from '../services/rescheduleService';
import { trackingService } from '../services/trackingService';
import { successResponse } from '../utils/response';
import { Role } from '../types';

export class OrderController {
  async calculatePreview(req: Request, res: Response, next: NextFunction) {
    try {
      const breakdown = await rateCalculationService.calculateRate(req.body);
      return successResponse(res, breakdown, 'Rate calculated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.role === Role.ADMIN && req.body.customerId ? req.body.customerId : req.user!.userId;
      const result = await orderService.createOrder({ ...req.body, customerId }, req.user!.role);
      return successResponse(res, result, 'Order created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };
      const result = await orderService.getOrders(filters as any, req.user!.userId, req.user!.role);
      return successResponse(res, result, 'Orders retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user!.userId, req.user!.role);
      return successResponse(res, order, 'Order retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, remarks, failureReason } = req.body;
      const updated = await orderService.updateStatus(
        req.params.id,
        status,
        req.user!.userId,
        req.user!.role,
        remarks,
        failureReason
      );
      return successResponse(res, updated, 'Order status updated', 200);
    } catch (err) {
      next(err);
    }
  }

  async autoAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.autoAssign(req.params.id, req.user!.userId);
      return successResponse(res, result, 'Agent auto-assigned successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async manualAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const { agentId } = req.body;
      if (!agentId) {
        throw new Error('agentId is required for manual assignment.');
      }
      const result = await assignmentService.manualAssign(req.params.id, agentId, req.user!.userId);
      return successResponse(res, result, 'Agent manually assigned successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestedDate, reason } = req.body;
      const result = await rescheduleService.rescheduleOrder({
        orderId: req.params.id,
        customerId: req.user!.userId,
        requestedDate: new Date(requestedDate),
        reason,
      });
      return successResponse(res, result, 'Order rescheduled successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await trackingService.getOrderTimeline(req.params.id);
      return successResponse(res, timeline, 'Tracking timeline retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await rescheduleService.getRescheduleHistory(req.params.id);
      return successResponse(res, result, 'Delivery attempts and history retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const cancelled = await orderService.cancelOrder(req.params.id, req.user!.userId, req.user!.role, reason);
      return successResponse(res, cancelled, 'Order cancelled', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
