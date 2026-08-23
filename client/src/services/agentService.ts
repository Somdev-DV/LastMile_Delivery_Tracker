import api from './api';
import type {
  DeliveryAgent,
  Order,
  AgentAvailability,
} from '../types';

export const agentService = {
  async getAgents(params?: {
    page?: number;
    limit?: number;
    availability?: string;
    zoneId?: string;
    isActive?: boolean;
  }): Promise<DeliveryAgent[]> {
    const res = await api.get<any>('/agents', { params });
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async getAgent(id: string): Promise<DeliveryAgent> {
    const res = await api.get<any>(`/agents/${id}`);
    return res.data?.data ?? res.data;
  },

  async updateAvailability(
    id: string,
    availability: AgentAvailability
  ): Promise<DeliveryAgent> {
    const res = await api.patch<any>(`/agents/${id}/availability`, { availability });
    return res.data?.data ?? res.data;
  },

  async updateAgent(
    id: string,
    data: Partial<DeliveryAgent>
  ): Promise<DeliveryAgent> {
    const res = await api.patch<any>(`/agents/${id}`, data);
    return res.data?.data ?? res.data;
  },

  async getMyProfile(): Promise<DeliveryAgent> {
    const res = await api.get<any>('/agents/me');
    return res.data?.data ?? res.data;
  },

  async getAssignedDeliveries(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Order[]; total: number }> {
    const res = await api.get<any>('/agents/me/deliveries', { params });
    const payload = res.data?.data ?? res.data;
    if (payload?.data && Array.isArray(payload.data)) {
      return { data: payload.data, total: payload.total ?? payload.data.length };
    }
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }
    return { data: [], total: 0 };
  },

  async getDeliveryHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Order[]; total: number }> {
    const res = await api.get<any>('/agents/me/history', { params });
    const payload = res.data?.data ?? res.data;
    if (payload?.data && Array.isArray(payload.data)) {
      return { data: payload.data, total: payload.total ?? payload.data.length };
    }
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }
    return { data: [], total: 0 };
  },

  async updateDeliveryStatus(
    orderId: string,
    status: string,
    remarks?: string,
    failureReason?: string
  ): Promise<Order> {
    const res = await api.post<any>(`/orders/${orderId}/status`, {
      status,
      remarks,
      failureReason,
    });
    return res.data?.data ?? res.data;
  },

  async assignAgent(
    orderId: string,
    agentId: string
  ): Promise<any> {
    const res = await api.post<any>(`/orders/${orderId}/assign`, { agentId });
    return res.data?.data ?? res.data;
  },

  async autoAssign(orderId: string): Promise<any> {
    const res = await api.post<any>(`/orders/${orderId}/auto-assign`);
    return res.data?.data ?? res.data;
  },
};

export default agentService;
