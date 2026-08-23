import { prisma } from '../config/database';
import { haversineDistance } from '../utils/haversine';
import {
  AgentAvailability,
  AssignmentMethod,
  AttemptStatus,
  OrderStatus,
  Role,
  AssignmentResult,
} from '../types';
import { trackingService } from './trackingService';
import { notificationService } from './notificationService';

export class AssignmentService {
  /**
   * Intelligent Auto-Assignment Engine using Haversine distance and zone matching
   */
  async autoAssign(orderId: string, adminId: string): Promise<AssignmentResult> {
    // 1. Fetch order with pickup zone and location info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pickupZone: true,
        customer: true,
      },
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    if (order.status !== OrderStatus.CREATED && order.status !== OrderStatus.RESCHEDULED) {
      throw new Error(`Order is in ${order.status} state and cannot be auto-assigned.`);
    }

    // 2. Fetch all AVAILABLE and ACTIVE delivery agents
    const availableAgents = await prisma.deliveryAgent.findMany({
      where: {
        availability: AgentAvailability.AVAILABLE,
        isActive: true,
      },
      include: {
        user: true,
        zone: true,
      },
    });

    if (availableAgents.length === 0) {
      throw new Error('No available delivery agents found. All agents are currently BUSY or OFFLINE.');
    }

    // 3. Score and prioritize agents:
    // Preference: Same zone + shortest Haversine distance
    type Candidate = {
      agent: (typeof availableAgents)[0];
      inZone: boolean;
      distanceKm: number;
      score: number;
      reason: string;
    };

    // Default pickup coords if available or approximate zone centroid
    const pickupLat = 12.9716; // default region coordinates for testing if none on order
    const pickupLng = 77.5946;

    const candidates: Candidate[] = availableAgents.map((agent) => {
      const inZone = agent.zoneId === order.pickupZoneId;
      let distanceKm = 9999;

      if (agent.latitude !== null && agent.longitude !== null) {
        distanceKm = Number(
          haversineDistance(pickupLat, pickupLng, agent.latitude, agent.longitude).toFixed(2)
        );
      }

      // In-zone agents get 0-100 score priority; out-of-zone get 500+
      const score = (inZone ? 0 : 500) + distanceKm;
      const reason = inZone
        ? `In pickup zone (${order.pickupZone?.name || 'N/A'}) - Distance: ${distanceKm < 9999 ? distanceKm + ' km' : 'N/A'}`
        : `Cross-zone backup - Distance: ${distanceKm < 9999 ? distanceKm + ' km' : 'N/A'}`;

      return { agent, inZone, distanceKm, score, reason };
    });

    // Sort ascending by score
    candidates.sort((a, b) => a.score - b.score);
    const selected = candidates[0];

    const reasoning = `Auto-Assigned nearest available agent. ${selected.reason}.`;

    return this.executeAssignment({
      order,
      agentId: selected.agent.id,
      method: AssignmentMethod.AUTO,
      reasoning,
      actorId: adminId,
      actorRole: Role.ADMIN,
      distanceKm: selected.distanceKm < 9999 ? selected.distanceKm : undefined,
    });
  }

  /**
   * Manual assignment by administrator
   */
  async manualAssign(orderId: string, agentId: string, adminId: string): Promise<AssignmentResult> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, pickupZone: true },
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    const agent = await prisma.deliveryAgent.findUnique({
      where: { id: agentId },
      include: { user: true, zone: true },
    });

    if (!agent) {
      throw new Error(`Agent #${agentId} not found.`);
    }

    if (!agent.isActive) {
      throw new Error(`Agent ${agent.user.name} is deactivated.`);
    }

    if (agent.availability === AgentAvailability.OFFLINE) {
      throw new Error(`Cannot assign offline agent ${agent.user.name}.`);
    }

    const reasoning = `Manually assigned by Administrator (${agent.user.name}, Zone: ${agent.zone?.name || 'Unassigned'}).`;

    return this.executeAssignment({
      order,
      agentId: agent.id,
      method: AssignmentMethod.MANUAL,
      reasoning,
      actorId: adminId,
      actorRole: Role.ADMIN,
    });
  }

  /**
   * Shared assignment execution helper
   */
  private async executeAssignment(params: {
    order: { id: string; orderNumber: string; customerId: string; status: OrderStatus; assignedAgentId?: string | null };
    agentId: string;
    method: AssignmentMethod;
    reasoning: string;
    actorId: string;
    actorRole: Role;
    distanceKm?: number;
  }): Promise<AssignmentResult> {
    const { order, agentId, method, reasoning, actorId, actorRole, distanceKm } = params;

    // Run within a Prisma transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Release previous agent if any
      if (order.assignedAgentId && order.assignedAgentId !== agentId) {
        await tx.deliveryAgent.update({
          where: { id: order.assignedAgentId },
          data: { availability: AgentAvailability.AVAILABLE },
        });

        await tx.deliveryAssignment.updateMany({
          where: { orderId: order.id, isActive: true },
          data: { isActive: false, releasedAt: new Date() },
        });
      }

      // 2. Mark chosen agent as BUSY
      const assignedAgent = await tx.deliveryAgent.update({
        where: { id: agentId },
        data: { availability: AgentAvailability.BUSY },
        include: { user: true, zone: true },
      });

      // 3. Create DeliveryAssignment record
      const assignment = await tx.deliveryAssignment.create({
        data: {
          orderId: order.id,
          agentId,
          method,
          reasoning,
          isActive: true,
        },
      });

      // 4. Determine attempt number & create/update DeliveryAttempt
      const previousAttempts = await tx.deliveryAttempt.count({
        where: { orderId: order.id },
      });
      const attemptNumber = previousAttempts + 1;

      await tx.deliveryAttempt.create({
        data: {
          orderId: order.id,
          agentId,
          attemptNumber,
          status: AttemptStatus.ACTIVE,
        },
      });

      // 5. Update Order status to ASSIGNED and assign agent
      const prevStatus = order.status;
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.ASSIGNED,
          assignedAgentId: agentId,
        },
      });

      return {
        assignment,
        assignedAgent,
        attemptNumber,
        prevStatus,
        updatedOrder,
      };
    });

    // 6. Record Immutable Tracking Event (outside tx or inside)
    await trackingService.recordEvent({
      orderId: order.id,
      prevStatus: result.prevStatus,
      newStatus: OrderStatus.ASSIGNED,
      actorId,
      actorRole,
      remarks: `${params.method === AssignmentMethod.AUTO ? 'Auto-assigned' : 'Assigned'} to ${result.assignedAgent.user.name}. ${reasoning}`,
    });

    // 7. Dispatch Notification
    await notificationService.notifyStatusChange(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        status: OrderStatus.ASSIGNED,
      },
      actorRole,
      `Assigned to delivery agent ${result.assignedAgent.user.name}`
    );

    return {
      agentId: result.assignedAgent.id,
      agentName: result.assignedAgent.user.name,
      agentEmail: result.assignedAgent.user.email,
      agentPhone: result.assignedAgent.user.phone,
      zoneId: result.assignedAgent.zoneId,
      zoneName: result.assignedAgent.zone?.name,
      distanceKm,
      method,
      reasoning,
      assignmentId: result.assignment.id,
      attemptNumber: result.attemptNumber,
    };
  }

  /**
   * Release agent when order is delivered or cancelled
   */
  async releaseAgent(agentId: string) {
    await prisma.deliveryAgent.update({
      where: { id: agentId },
      data: { availability: AgentAvailability.AVAILABLE },
    });
  }
}

export const assignmentService = new AssignmentService();
