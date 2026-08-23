import api from './api';
import type { RateCard, CodSurcharge } from '../types';

export const rateService = {
  async getRates(params?: {
    orderType?: string;
    routeType?: string;
    isActive?: boolean;
  }): Promise<RateCard[]> {
    const res = await api.get<any>('/rates', { params });
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async getRateCards(params?: {
    orderType?: string;
    routeType?: string;
    isActive?: boolean;
  }): Promise<RateCard[]> {
    return this.getRates(params);
  },

  async getRateCard(id: string): Promise<RateCard> {
    const res = await api.get<any>(`/rates/${id}`);
    return res.data?.data ?? res.data;
  },

  async createRate(data: Omit<RateCard, 'id' | 'zone'>): Promise<RateCard> {
    const res = await api.post<any>('/rates', data);
    return res.data?.data ?? res.data;
  },

  async createRateCard(data: Omit<RateCard, 'id' | 'zone'>): Promise<RateCard> {
    return this.createRate(data);
  },

  async updateRate(id: string, data: Partial<RateCard>): Promise<RateCard> {
    const res = await api.patch<any>(`/rates/${id}`, data);
    return res.data?.data ?? res.data;
  },

  async updateRateCard(id: string, data: Partial<RateCard>): Promise<RateCard> {
    return this.updateRate(id, data);
  },

  async deleteRateCard(id: string): Promise<void> {
    await api.delete(`/rates/${id}`);
  },

  async getCodSurcharges(): Promise<CodSurcharge[]> {
    const res = await api.get<any>('/rates/cod');
    const payload = res.data?.data ?? res.data;
    return Array.isArray(payload) ? payload : [];
  },

  async updateCodSurcharge(data: Partial<CodSurcharge>): Promise<CodSurcharge> {
    const res = await api.post<any>('/rates/cod', data);
    return res.data?.data ?? res.data;
  },
};

export default rateService;
