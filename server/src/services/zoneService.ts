import { prisma } from '../config/database';
import { RouteType } from '../types';

export class ZoneService {
  async findZoneByPincode(pincode: string) {
    const cleanPincode = pincode.trim();
    const area = await prisma.area.findFirst({
      where: { pincode: cleanPincode, isActive: true },
      include: { zone: true },
    });

    if (area && area.zone && area.zone.isActive) {
      return area.zone;
    }
    return null;
  }

  async findZoneByCity(city: string) {
    const cleanCity = city.trim();
    const area = await prisma.area.findFirst({
      where: {
        city: { equals: cleanCity, mode: 'insensitive' },
        isActive: true,
      },
      include: { zone: true },
    });

    if (area && area.zone && area.zone.isActive) {
      return area.zone;
    }
    return null;
  }

  async detectZone(pincode: string, city?: string) {
    const zoneByPin = await this.findZoneByPincode(pincode);
    if (zoneByPin) return zoneByPin;

    if (city) {
      const zoneByCity = await this.findZoneByCity(city);
      if (zoneByCity) return zoneByCity;
    }

    return null;
  }

  getRouteType(pickupZoneId: string, dropZoneId: string): RouteType {
    if (pickupZoneId === dropZoneId) {
      return RouteType.INTRA_ZONE;
    }
    return RouteType.INTER_ZONE;
  }

  async getAllZones() {
    return prisma.zone.findMany({
      include: {
        areas: {
          where: { isActive: true },
        },
        _count: {
          select: { areas: true, agents: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getZoneById(id: string) {
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        areas: { where: { isActive: true } },
        agents: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        rateCards: { where: { isActive: true } },
      },
    });
    if (!zone) {
      throw new Error(`Zone with ID ${id} not found.`);
    }
    return zone;
  }

  async createZone(data: { name: string; description?: string }) {
    const existing = await prisma.zone.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new Error(`Zone with name "${data.name}" already exists.`);
    }
    return prisma.zone.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async updateZone(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return prisma.zone.update({
      where: { id },
      data,
    });
  }

  async deleteZone(id: string) {
    // Soft delete/deactivate
    return prisma.zone.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getAreasByZone(zoneId: string) {
    return prisma.area.findMany({
      where: { zoneId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async addArea(zoneId: string, data: { name: string; pincode: string; city?: string }) {
    const cleanPincode = data.pincode.trim();
    const existing = await prisma.area.findUnique({ where: { pincode: cleanPincode } });
    if (existing) {
      throw new Error(`Area with pincode ${cleanPincode} already mapped to zone.`);
    }

    return prisma.area.create({
      data: {
        name: data.name,
        pincode: cleanPincode,
        city: data.city,
        zoneId,
      },
    });
  }

  async updateArea(areaId: string, data: { name?: string; city?: string; isActive?: boolean }) {
    return prisma.area.update({
      where: { id: areaId },
      data,
    });
  }

  async removeArea(areaId: string) {
    return prisma.area.update({
      where: { id: areaId },
      data: { isActive: false },
    });
  }
}

export const zoneService = new ZoneService();
