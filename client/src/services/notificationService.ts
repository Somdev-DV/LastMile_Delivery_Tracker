import api from './api';
import type { Notification, ApiResponse, PaginatedResponse } from '../types';

export const notificationService = {
  async getMyNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const res = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
      '/notifications/me',
      { params }
    );
    return res.data.data;
  },
};
