import { prisma } from '../config/database';
import { AgentAvailability, OrderStatus, OrderType, RouteType, Role } from '../types';

export class AdminService {
  /**
   * Executive Dashboard Statistics
   */
  async getDashboardMetrics() {
    const [
      totalOrders,
      pendingOrders,
      inTransitOrders,
      outForDeliveryOrders,
      deliveredOrders,
      failedOrders,
      availableAgents,
      busyAgents,
      offlineAgents,
      unassignedOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.CREATED } }),
      prisma.order.count({ where: { status: OrderStatus.IN_TRANSIT } }),
      prisma.order.count({ where: { status: OrderStatus.OUT_FOR_DELIVERY } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.FAILED } }),
      prisma.deliveryAgent.count({ where: { availability: AgentAvailability.AVAILABLE, isActive: true } }),
      prisma.deliveryAgent.count({ where: { availability: AgentAvailability.BUSY, isActive: true } }),
      prisma.deliveryAgent.count({ where: { availability: AgentAvailability.OFFLINE, isActive: true } }),
      prisma.order.count({
        where: {
          assignedAgentId: null,
          status: { in: [OrderStatus.CREATED, OrderStatus.RESCHEDULED] },
        },
      }),
      prisma.order.findMany({
        take: 10,
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
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      inTransitOrders,
      outForDeliveryOrders,
      deliveredOrders,
      failedOrders,
      availableAgents,
      busyAgents,
      offlineAgents,
      unassignedOrders,
      recentOrders,
    };
  }

  // --- Rate Cards ---
  async getRateCards() {
    return prisma.rateCard.findMany({
      include: { zone: true },
      orderBy: [{ orderType: 'asc' }, { routeType: 'asc' }],
    });
  }

  async createRateCard(data: {
    zoneId?: string | null;
    orderType: OrderType;
    routeType: RouteType;
    baseRate: number;
    perKgRate: number;
    minWeight?: number;
  }) {
    return prisma.rateCard.create({
      data: {
        zoneId: data.zoneId || null,
        orderType: data.orderType,
        routeType: data.routeType,
        baseRate: Number(data.baseRate),
        perKgRate: Number(data.perKgRate),
        minWeight: data.minWeight !== undefined ? Number(data.minWeight) : 0.5,
      },
      include: { zone: true },
    });
  }

  async updateRateCard(
    id: string,
    data: { baseRate?: number; perKgRate?: number; minWeight?: number; isActive?: boolean }
  ) {
    return prisma.rateCard.update({
      where: { id },
      data: {
        baseRate: data.baseRate !== undefined ? Number(data.baseRate) : undefined,
        perKgRate: data.perKgRate !== undefined ? Number(data.perKgRate) : undefined,
        minWeight: data.minWeight !== undefined ? Number(data.minWeight) : undefined,
        isActive: data.isActive,
      },
      include: { zone: true },
    });
  }

  // --- COD Surcharges ---
  async getCodConfigs() {
    return prisma.codSurcharge.findMany({
      orderBy: { orderType: 'asc' },
    });
  }

  async setCodConfig(data: { orderType: OrderType; percentage: number; flatAmount?: number }) {
    return prisma.codSurcharge.upsert({
      where: { orderType: data.orderType },
      create: {
        orderType: data.orderType,
        percentage: Number(data.percentage),
        flatAmount: data.flatAmount !== undefined ? Number(data.flatAmount) : 0,
      },
      update: {
        percentage: Number(data.percentage),
        flatAmount: data.flatAmount !== undefined ? Number(data.flatAmount) : 0,
      },
    });
  }

  // --- Agents Management ---
  async getAllAgents() {
    return prisma.deliveryAgent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        zone: true,
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: [OrderStatus.ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY],
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAgent(
    agentId: string,
    data: { availability?: AgentAvailability; zoneId?: string | null; isActive?: boolean; vehicleType?: string }
  ) {
    return prisma.deliveryAgent.update({
      where: { id: agentId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        zone: true,
      },
    });
  }

  // --- Users Management ---
  async getAllUsers(role?: Role) {
    return prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        customerProfile: true,
        agentProfile: {
          include: { zone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const adminService = new AdminService();
