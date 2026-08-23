import { Router } from 'express';
import { rateController } from '../controllers/rate.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../types';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/', (req, res, next) => rateController.getAllRateCards(req, res, next));
router.post('/', (req, res, next) => rateController.createRateCard(req, res, next));
router.patch('/:id', (req, res, next) => rateController.updateRateCard(req, res, next));

router.get('/cod', (req, res, next) => rateController.getCodConfigs(req, res, next));
router.post('/cod', (req, res, next) => rateController.setCodConfig(req, res, next));

export default router;
