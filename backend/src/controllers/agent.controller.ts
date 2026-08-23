import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { adminService } from '../services/adminService';
import { successResponse } from '../utils/response';
import { AgentAvailability, OrderStatus, Role } from '../types';

export class AgentController {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await prisma.deliveryAgent.findUnique({
        where: { userId: req.user!.userId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          zone: true,
        },
      });
      if (!agent) throw new Error('Agent profile not found.');
      return successResponse(res, agent, 'Agent profile retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getMyDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await prisma.deliveryAgent.findUnique({ where: { userId: req.user!.userId } });
      if (!agent) throw new Error('Agent profile not found.');

      const orders = await prisma.order.findMany({
        where: {
          assignedAgentId: agent.id,
          status: {
            in: [
              OrderStatus.ASSIGNED,
              OrderStatus.PICKED_UP,
              OrderStatus.IN_TRANSIT,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          pickupZone: true,
          dropZone: true,
          trackingEvents: { orderBy: { timestamp: 'desc' }, take: 2 },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return successResponse(res, { data: orders, total: orders.length }, 'Deliveries retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getMyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await prisma.deliveryAgent.findUnique({ where: { userId: req.user!.userId } });
      if (!agent) throw new Error('Agent profile not found.');

      const orders = await prisma.order.findMany({
        where: {
          assignedAgentId: agent.id,
          status: {
            in: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.CANCELLED],
          },
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          pickupZone: true,
          dropZone: true,
          trackingEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return successResponse(res, { data: orders, total: orders.length }, 'Delivery history retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAllAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await adminService.getAllAgents();
      return successResponse(res, agents, 'Agents retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAvailableAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await prisma.deliveryAgent.findMany({
        where: {
          availability: AgentAvailability.AVAILABLE,
          isActive: true,
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          zone: true,
        },
      });
      return successResponse(res, agents, 'Available agents retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAgentProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.params.id;
      const agent = await prisma.deliveryAgent.findUnique({
        where: { id: agentId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          zone: true,
        },
      });
      if (!agent) throw new Error('Agent not found.');
      return successResponse(res, agent, 'Agent retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { availability } = req.body;
      const agentId = req.params.id;

      // Ensure agent is updating own status or admin
      if (req.user!.role === Role.DELIVERY_AGENT) {
        const myAgent = await prisma.deliveryAgent.findUnique({ where: { userId: req.user!.userId } });
        if (!myAgent || myAgent.id !== agentId) {
          throw new Error('Not authorized to update another agent’s status.');
        }
      }

      const updated = await adminService.updateAgent(agentId, { availability });
      return successResponse(res, updated, 'Availability updated', 200);
    } catch (err) {
      next(err);
    }
  }

  async getAssignedDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.params.id;
      const orders = await prisma.order.findMany({
        where: {
          assignedAgentId: agentId,
          status: {
            in: [
              OrderStatus.ASSIGNED,
              OrderStatus.PICKED_UP,
              OrderStatus.IN_TRANSIT,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          pickupZone: true,
          dropZone: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      return successResponse(res, orders, 'Assigned deliveries retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await adminService.updateAgent(req.params.id, req.body);
      return successResponse(res, updated, 'Agent updated', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const agentController = new AgentController();
