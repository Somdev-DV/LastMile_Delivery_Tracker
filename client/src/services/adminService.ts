import api from './api';
import type {
  DashboardStats,
  Order,
  User,
  Notification,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<any>('/admin/dashboard');
    return res.data?.data || res.data;
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const res = await api.get<any>('/admin/users', { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        page: 1,
        limit: payload.length,
      };
    }
    return payload || { data: [], total: 0, page: 1, limit: 10 };
  },

  async getAllUsers(role?: string): Promise<User[]> {
    const res = await api.get<any>('/admin/users', { params: { role } });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) return payload;
    return payload?.data || [];
  },

  async getUser(id: string): Promise<User> {
    const res = await api.get<any>(`/admin/users/${id}`);
    return res.data?.data || res.data;
  },

  async toggleUserActive(id: string): Promise<User> {
    const res = await api.put<any>(`/admin/users/${id}/toggle-active`);
    return res.data?.data || res.data;
  },

  async overrideOrderStatus(
    orderId: string,
    status: string,
    remarks?: string
  ): Promise<Order> {
    const res = await api.post<any>(`/admin/orders/${orderId}/override-status`, {
      status,
      remarks,
    });
    return res.data?.data || res.data;
  },

  async overrideStatus(
    orderId: string,
    status: string,
    remarks?: string
  ): Promise<Order> {
    return this.overrideOrderStatus(orderId, status, remarks);
  },

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    orderId?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const res = await api.get<any>('/admin/notifications', { params });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        page: 1,
        limit: payload.length,
      };
    }
    return payload || { data: [], total: 0, page: 1, limit: 10 };
  },

  async getRecentOrders(limit = 10): Promise<Order[]> {
    const res = await api.get<any>('/admin/orders/recent', {
      params: { limit },
    });
    return res.data?.data || res.data || [];
  },
};

export default adminService;
