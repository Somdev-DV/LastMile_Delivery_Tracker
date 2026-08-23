import { Router } from 'express';
import { zoneController } from '../controllers/zone.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../types';

const router = Router();

// Public zone detection helper
router.get('/detect', (req, res, next) => zoneController.detectZone(req, res, next));
router.get('/', (req, res, next) => zoneController.getAllZones(req, res, next));
router.get('/:id', (req, res, next) => zoneController.getZoneById(req, res, next));

// Admin Zone Configuration
router.use(authenticate, authorize(Role.ADMIN));

router.post('/', (req, res, next) => zoneController.createZone(req, res, next));
router.patch('/:id', (req, res, next) => zoneController.updateZone(req, res, next));
router.delete('/:id', (req, res, next) => zoneController.deleteZone(req, res, next));

router.post('/:id/areas', (req, res, next) => zoneController.addArea(req, res, next));
router.delete('/areas/:areaId', (req, res, next) => zoneController.removeArea(req, res, next));

export default router;
