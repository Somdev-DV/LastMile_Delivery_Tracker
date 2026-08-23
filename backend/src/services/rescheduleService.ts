import { prisma } from '../config/database';
import { AttemptStatus, OrderStatus, Role } from '../types';
import { trackingService } from './trackingService';
import { notificationService } from './notificationService';
import { assignmentService } from './assignmentService';

export interface RescheduleInput {
  orderId: string;
  customerId: string;
  requestedDate: Date;
  reason?: string;
}

export class RescheduleService {
  /**
   * Reschedule a failed delivery order
   */
  async rescheduleOrder(input: RescheduleInput) {
    const { orderId, customerId, requestedDate, reason } = input;

    // 1. Fetch order and validate
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    if (order.customerId !== customerId) {
      throw new Error('You are not authorized to reschedule this order.');
    }

    if (order.status !== OrderStatus.FAILED) {
      throw new Error(`Only FAILED delivery orders can be rescheduled. Current status is ${order.status}.`);
    }

    const requestedTime = new Date(requestedDate).getTime();
    if (isNaN(requestedTime) || requestedTime < Date.now() - 3600000) {
      throw new Error('Reschedule date must be a valid upcoming date.');
    }

    // 2. Create Reschedule Request Record
    const rescheduleRequest = await prisma.rescheduleRequest.create({
      data: {
        orderId,
        requestedDate: new Date(requestedDate),
        reason: reason || 'Customer requested rescheduling',
        status: 'APPROVED',
      },
    });

    // 3. Update Order status to RESCHEDULED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.RESCHEDULED,
      },
    });

    // 4. Record Immutable Tracking Event
    await trackingService.recordEvent({
      orderId,
      prevStatus: OrderStatus.FAILED,
      newStatus: OrderStatus.RESCHEDULED,
      actorId: customerId,
      actorRole: Role.CUSTOMER,
      remarks: `Delivery rescheduled for ${new Date(requestedDate).toLocaleDateString()}. Reason: ${reason || 'Customer request'}`,
    });

    // 5. Notify customer
    await notificationService.notifyRescheduled(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
      },
      new Date(requestedDate)
    );

    // 6. Attempt auto-reassignment for the new attempt
    let newAssignment = null;
    try {
      newAssignment = await assignmentService.autoAssign(order.id, customerId);
    } catch (err: any) {
      // If no agent is currently available, it remains in RESCHEDULED state for admin assignment
      console.log(`[RescheduleService] Auto-assign on reschedule: ${err.message}`);
    }

    return {
      order: updatedOrder,
      rescheduleRequest,
      newAssignment,
    };
  }

  /**
   * Fetch reschedule history and delivery attempts for an order
   */
  async getRescheduleHistory(orderId: string) {
    const [rescheduleRequests, attempts] = await Promise.all([
      prisma.rescheduleRequest.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.deliveryAttempt.findMany({
        where: { orderId },
        include: {
          agent: {
            include: {
              user: { select: { name: true, phone: true, email: true } },
            },
          },
        },
        orderBy: { attemptNumber: 'asc' },
      }),
    ]);

    return {
      rescheduleRequests,
      attempts,
    };
  }
}

export const rescheduleService = new RescheduleService();
