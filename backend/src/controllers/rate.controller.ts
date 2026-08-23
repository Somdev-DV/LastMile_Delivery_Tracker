import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { successResponse } from '../utils/response';

export class RateController {
  async getAllRateCards(req: Request, res: Response, next: NextFunction) {
    try {
      const cards = await adminService.getRateCards();
      return successResponse(res, cards, 'Rate cards retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async createRateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await adminService.createRateCard(req.body);
      return successResponse(res, card, 'Rate card created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await adminService.updateRateCard(req.params.id, req.body);
      return successResponse(res, card, 'Rate card updated', 200);
    } catch (err) {
      next(err);
    }
  }

  async getCodConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await adminService.getCodConfigs();
      return successResponse(res, configs, 'COD configurations retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  async setCodConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await adminService.setCodConfig(req.body);
      return successResponse(res, config, 'COD configuration updated', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const rateController = new RateController();
