import api from './api';
import type { Zone, Area } from '../types';

export const zoneService = {
  async getZones(params?: {
    isActive?: boolean;
  }): Promise<Zone[]> {
    const res = await api.get<any>('/zones', { params });
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async getZone(id: string): Promise<Zone> {
    const res = await api.get<any>(`/zones/${id}`);
    return res.data?.data ?? res.data;
  },

  async createZone(data: {
    name: string;
    description?: string;
  }): Promise<Zone> {
    const res = await api.post<any>('/zones', data);
    return res.data?.data ?? res.data;
  },

  async updateZone(
    id: string,
    data: Partial<Zone>
  ): Promise<Zone> {
    const res = await api.patch<any>(`/zones/${id}`, data);
    return res.data?.data ?? res.data;
  },

  async deleteZone(id: string): Promise<void> {
    await api.delete(`/zones/${id}`);
  },

  async getAreasByZone(zoneId: string): Promise<Area[]> {
    const res = await api.get<any>(`/zones/${zoneId}/areas`);
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async addArea(
    zoneId: string,
    data: { name: string; pincode: string; city?: string }
  ): Promise<Area> {
    const res = await api.post<any>(`/zones/${zoneId}/areas`, data);
    return res.data?.data ?? res.data;
  },

  async removeArea(areaId: string): Promise<void> {
    await api.delete(`/zones/areas/${areaId}`);
  },

  async detectZoneByPincode(pincode: string): Promise<Zone | null> {
    try {
      const res = await api.get<any>(`/zones/detect/${pincode.trim()}`);
      return res.data?.data ?? res.data ?? null;
    } catch {
      return null;
    }
  },

  async detectZone(pincode: string): Promise<Zone | null> {
    return this.detectZoneByPincode(pincode);
  },
};

export default zoneService;
