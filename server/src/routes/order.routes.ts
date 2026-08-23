import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../types';

const router = Router();

// Pricing calculation preview (public or authenticated)
router.post('/calculate', (req, res, next) => orderController.calculatePreview(req, res, next));
router.post('/calculate-price', (req, res, next) => orderController.calculatePreview(req, res, next));

// Authenticated order routes
router.use(authenticate);

router.post('/', (req, res, next) => orderController.createOrder(req, res, next));
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));
router.get('/my-orders', (req, res, next) => orderController.getOrders(req, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));
router.get('/:id/tracking', (req, res, next) => orderController.getTracking(req, res, next));
router.get('/:id/attempts', (req, res, next) => orderController.getAttempts(req, res, next));
router.post('/:id/cancel', (req, res, next) => orderController.cancelOrder(req, res, next));
router.post('/:id/reschedule', (req, res, next) => orderController.reschedule(req, res, next));

// Agent / Admin status update
router.post(
  '/:id/status',
  authorize(Role.DELIVERY_AGENT, Role.ADMIN),
  (req, res, next) => orderController.updateStatus(req, res, next)
);

// Admin Agent Assignment
router.post(
  '/:id/assign',
  authorize(Role.ADMIN),
  (req, res, next) => orderController.manualAssign(req, res, next)
);

router.post(
  '/:id/auto-assign',
  authorize(Role.ADMIN),
  (req, res, next) => orderController.autoAssign(req, res, next)
);

export default router;
