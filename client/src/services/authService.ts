import api from './api';
import type { User, ApiResponse } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return res.data.data;
  },

  async register(data: RegisterData): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/auth/register', data);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.put('/auth/password', { currentPassword, newPassword });
  },
};
