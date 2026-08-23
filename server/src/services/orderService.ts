import { prisma } from '../config/database';
import { generateOrderNumber } from '../utils/orderNumber';
import { isValidTransition } from '../utils/statusMachine';
import {
  OrderStatus,
  OrderType,
  PaymentType,
  Role,
  OrderFilters,
  PaginatedResult,
  AttemptStatus,
} from '../types';
import { rateCalculationService } from './rateCalculationService';
import { trackingService } from './trackingService';
import { notificationService } from './notificationService';
import { assignmentService } from './assignmentService';

export interface CreateOrderInput {
  customerId: string;
  pickupAddress: string;
  pickupPincode: string;
  pickupCity?: string;
  dropAddress: string;
  dropPincode: string;
  dropCity?: string;
  length: number;
  breadth: number;
  height: number;
  actualWeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
  codAmount?: number;
  remarks?: string;
}

export class OrderService {
  /**
   * Create a new delivery order with upfront rate calculation and tracking history
   */
  async createOrder(input: CreateOrderInput, creatorRole: Role = Role.CUSTOMER) {
    // 1. Calculate pricing breakdown using rateCalculationService
    const rate = await rateCalculationService.calculateRate({
      pickupPincode: input.pickupPincode,
      pickupCity: input.pickupCity,
      dropPincode: input.dropPincode,
      dropCity: input.dropCity,
      length: input.length,
      breadth: input.breadth,
      height: input.height,
      actualWeight: input.actualWeight,
      orderType: input.orderType,
      paymentType: input.paymentType,
      codAmount: input.codAmount,
    });

    const orderNumber = generateOrderNumber();

    // 2. Create Order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: input.customerId,
        pickupAddress: input.pickupAddress,
        pickupPincode: input.pickupPincode.trim(),
        pickupCity: input.pickupCity,
        dropAddress: input.dropAddress,
        dropPincode: input.dropPincode.trim(),
        dropCity: input.dropCity,
        pickupZoneId: rate.pickupZoneId,
        dropZoneId: rate.dropZoneId,
        length: input.length,
        breadth: input.breadth,
        height: input.height,
        actualWeight: rate.actualWeight,
        volumetricWeight: rate.volumetricWeight,
        billableWeight: rate.billableWeight,
        orderType: input.orderType,
        paymentType: input.paymentType,
        codAmount: input.paymentType === PaymentType.COD ? input.codAmount : null,
        baseRate: rate.baseRate,
        weightCharge: rate.weightCharge,
        codSurcharge: rate.codSurcharge,
        calculatedCharge: rate.totalCharge,
        status: OrderStatus.CREATED,
        remarks: input.remarks,
      },
      include: {
        pickupZone: true,
        dropZone: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // 3. Append initial Tracking Event (Append-only)
    await trackingService.recordEvent({
      orderId: order.id,
      prevStatus: null,
      newStatus: OrderStatus.CREATED,
      actorId: input.customerId,
      actorRole: creatorRole,
      remarks: `Order created with ${rate.routeType} delivery charge ₹${rate.totalCharge.toFixed(2)}. ${rate.breakdown}`,
    });

    // 4. Send Order Created Notification
    await notificationService.notifyStatusChange(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: OrderStatus.CREATED,
      },
      creatorRole,
      `Delivery charge: ₹${rate.totalCharge.toFixed(2)}`
    );

    return { order, rateBreakdown: rate };
  }

  /**
   * Get single order by ID with role-based access control
   */
  async getOrderById(orderId: string, requesterId: string, requesterRole: Role) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        pickupZone: true,
        dropZone: true,
        assignedAgent: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            zone: true,
          },
        },
        trackingEvents: {
          include: {
            actor: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { timestamp: 'asc' },
        },
        attempts: {
          include: {
            agent: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
              },
            },
          },
          orderBy: { attemptNumber: 'asc' },
        },
        assignments: {
          include: {
            agent: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    // Role-based authorization
    if (requesterRole === Role.CUSTOMER && order.customerId !== requesterId) {
      throw new Error('You are not authorized to view this order.');
    }

    if (requesterRole === Role.DELIVERY_AGENT) {
      const agent = await prisma.deliveryAgent.findUnique({ where: { userId: requesterId } });
      if (!agent || order.assignedAgentId !== agent.id) {
        throw new Error('You are not assigned to this delivery order.');
      }
    }

    return order;
  }

  /**
   * List orders with filters and pagination
   */
  async getOrders(filters: OrderFilters, requesterId: string, requesterRole: Role): Promise<PaginatedResult<any>> {
    const {
      status,
      pickupZoneId,
      dropZoneId,
      agentId,
      customerId,
      search,
      orderType,
      paymentType,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    // Role scoping
    if (requesterRole === Role.CUSTOMER) {
      where.customerId = requesterId;
    } else if (requesterRole === Role.DELIVERY_AGENT) {
      const agent = await prisma.deliveryAgent.findUnique({ where: { userId: requesterId } });
      if (!agent) {
        return { items: [], total: 0, page, limit, totalPages: 0 };
      }
      where.assignedAgentId = agent.id;
    } else if (customerId) {
      where.customerId = customerId;
    }

    if (status) where.status = status;
    if (pickupZoneId) where.pickupZoneId = pickupZoneId;
    if (dropZoneId) where.dropZoneId = dropZoneId;
    if (agentId) where.assignedAgentId = agentId;
    if (orderType) where.orderType = orderType;
    if (paymentType) where.paymentType = paymentType;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { pickupAddress: { contains: search, mode: 'insensitive' } },
        { dropAddress: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          pickupZone: true,
          dropZone: true,
          assignedAgent: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update order delivery status with finite state machine validation
   */
  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    actorId: string,
    actorRole: Role,
    remarks?: string,
    failureReason?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { assignedAgent: true },
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    // Role checks
    if (actorRole === Role.DELIVERY_AGENT) {
      const agent = await prisma.deliveryAgent.findUnique({ where: { userId: actorId } });
      if (!agent || order.assignedAgentId !== agent.id) {
        throw new Error('You are not assigned to this delivery order.');
      }
    }

    // Finite State Machine Validation (Admin override still validates for sane states)
    if (actorRole !== Role.ADMIN && !isValidTransition(order.status, newStatus)) {
      throw new Error(`Invalid status transition: ${order.status} -> ${newStatus}.`);
    }

    const prevStatus = order.status;

    // Handle DELIVERED
    if (newStatus === OrderStatus.DELIVERED) {
      if (order.assignedAgentId) {
        await assignmentService.releaseAgent(order.assignedAgentId);
      }
      await prisma.deliveryAttempt.updateMany({
        where: { orderId: order.id, status: AttemptStatus.ACTIVE },
        data: { status: AttemptStatus.COMPLETED, completedAt: new Date() },
      });
    }

    // Handle FAILED
    if (newStatus === OrderStatus.FAILED) {
      const reason = failureReason || remarks || 'Customer unavailable / Address unreachable';
      if (order.assignedAgentId) {
        await assignmentService.releaseAgent(order.assignedAgentId);
      }
      await prisma.deliveryAttempt.updateMany({
        where: { orderId: order.id, status: AttemptStatus.ACTIVE },
        data: {
          status: AttemptStatus.FAILED,
          failureReason: reason,
          completedAt: new Date(),
        },
      });

      await notificationService.notifyDeliveryFailure(
        {
          id: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
        },
        reason
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Record Immutable Tracking Event
    await trackingService.recordEvent({
      orderId,
      prevStatus,
      newStatus,
      actorId,
      actorRole,
      remarks: failureReason ? `Failure Reason: ${failureReason}` : remarks,
    });

    // Dispatch Notification (if not failed, which already sent detailed alert)
    if (newStatus !== OrderStatus.FAILED) {
      await notificationService.notifyStatusChange(
        {
          id: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          status: newStatus,
        },
        actorRole,
        remarks
      );
    }

    return updatedOrder;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, actorId: string, actorRole: Role, reason?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    if (actorRole === Role.CUSTOMER && order.customerId !== actorId) {
      throw new Error('You are not authorized to cancel this order.');
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new Error(`Cannot cancel order in ${order.status} state.`);
    }

    if (order.assignedAgentId) {
      await assignmentService.releaseAgent(order.assignedAgentId);
    }

    const prevStatus = order.status;
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    await trackingService.recordEvent({
      orderId,
      prevStatus,
      newStatus: OrderStatus.CANCELLED,
      actorId,
      actorRole,
      remarks: reason || 'Order cancelled by user',
    });

    return updated;
  }
}

export const orderService = new OrderService();
