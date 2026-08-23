import api from './api';
import type {
  Order,
  ApiResponse,
  PaginatedResponse,
  RateBreakdown,
} from '../types';

export interface CreateOrderData {
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
  orderType: string;
  paymentType: string;
  codAmount?: number;
  remarks?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  orderType?: string;
  paymentType?: string;
  pickupZoneId?: string;
  dropZoneId?: string;
  agentId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PriceCalculateData {
  pickupPincode: string;
  dropPincode: string;
  length: number;
  breadth: number;
  height: number;
  actualWeight: number;
  orderType: string;
  paymentType: string;
  codAmount?: number;
}

export const orderService = {
  async getOrders(
    filters?: OrderFilters
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const res = await api.get<any>('/orders', { params: filters });
    const payload = res.data?.data || res.data;
    if (payload?.items) {
      return {
        data: payload.items,
        total: payload.total ?? payload.items.length,
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
      };
    }
    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        page: 1,
        limit: payload.length,
      };
    }
    return { data: [], total: 0, page: 1, limit: 10 };
  },

  async getOrder(id: string): Promise<Order> {
    const res = await api.get<any>(`/orders/${id}`);
    return res.data?.data || res.data;
  },

  async createOrder(data: CreateOrderData): Promise<Order> {
    const res = await api.post<any>('/orders', data);
    return res.data?.data?.order || res.data?.data || res.data;
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const res = await api.post<any>(`/orders/${id}/cancel`, {
      reason,
    });
    return res.data?.data || res.data;
  },

  async rescheduleOrder(
    id: string,
    scheduledDate: string,
    reason?: string
  ): Promise<Order> {
    const res = await api.post<any>(`/orders/${id}/reschedule`, {
      scheduledDate,
      reason,
    });
    return res.data?.data || res.data;
  },

  async calculatePrice(data: PriceCalculateData): Promise<RateBreakdown> {
    const res = await api.post<any>('/orders/calculate', data);
    return res.data?.data || res.data;
  },

  async getTrackingEvents(orderId: string) {
    const res = await api.get<any>(`/orders/${orderId}/tracking`);
    return res.data?.data || res.data || [];
  },

  async getMyOrders(filters?: OrderFilters): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    return this.getOrders(filters);
  },
};

export default orderService;
