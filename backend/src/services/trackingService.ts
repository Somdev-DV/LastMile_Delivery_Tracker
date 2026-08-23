import { prisma } from '../config/database';
import { OrderStatus, Role } from '../types';

export interface CreateTrackingEventInput {
  orderId: string;
  prevStatus?: OrderStatus | null;
  newStatus: OrderStatus;
  actorId: string;
  actorRole: Role;
  remarks?: string | null;
}

export class TrackingService {
  /**
   * Append a new tracking event. Tracking history is strictly IMMUTABLE.
   * Never updates or deletes past events.
   */
  async recordEvent(input: CreateTrackingEventInput) {
    const { orderId, prevStatus, newStatus, actorId, actorRole, remarks } = input;

    return prisma.trackingEvent.create({
      data: {
        orderId,
        prevStatus: prevStatus || null,
        newStatus,
        actorId,
        actorRole,
        remarks: remarks || null,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve chronological tracking timeline for an order
   */
  async getOrderTimeline(orderId: string) {
    return prisma.trackingEvent.findMany({
      where: { orderId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }
}

export const trackingService = new TrackingService();
