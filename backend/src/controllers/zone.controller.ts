import { Request, Response, NextFunction } from 'express';
import { zoneService } from '../services/zoneService';
import { successResponse } from '../utils/response';

export class ZoneController {
  async getAllZones(req: Request, res: Response, next: NextFunction) {
    try {
      const zones = await zoneService.getAllZones();
      return successResponse(res, zones, 'Zones retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async getZoneById(req: Request, res: Response, next: NextFunction) {
    try {
      const zone = await zoneService.getZoneById(req.params.id);
      return successResponse(res, zone, 'Zone retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async createZone(req: Request, res: Response, next: NextFunction) {
    try {
      const zone = await zoneService.createZone(req.body);
      return successResponse(res, zone, 'Zone created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateZone(req: Request, res: Response, next: NextFunction) {
    try {
      const zone = await zoneService.updateZone(req.params.id, req.body);
      return successResponse(res, zone, 'Zone updated', 200);
    } catch (err) {
      next(err);
    }
  }

  async deleteZone(req: Request, res: Response, next: NextFunction) {
    try {
      await zoneService.deleteZone(req.params.id);
      return successResponse(res, null, 'Zone deactivated', 200);
    } catch (err) {
      next(err);
    }
  }

  async addArea(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await zoneService.addArea(req.params.id, req.body);
      return successResponse(res, area, 'Area added to zone', 201);
    } catch (err) {
      next(err);
    }
  }

  async removeArea(req: Request, res: Response, next: NextFunction) {
    try {
      await zoneService.removeArea(req.params.areaId);
      return successResponse(res, null, 'Area removed', 200);
    } catch (err) {
      next(err);
    }
  }

  async detectZone(req: Request, res: Response, next: NextFunction) {
    try {
      const pincode = (req.query.pincode as string) || '';
      const city = req.query.city as string | undefined;
      const zone = await zoneService.detectZone(pincode, city);
      if (!zone) {
        throw new Error(`No zone mapped for pincode "${pincode}".`);
      }
      return successResponse(res, zone, 'Zone detected', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const zoneController = new ZoneController();
