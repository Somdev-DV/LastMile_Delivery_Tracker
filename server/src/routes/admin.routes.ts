import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../types';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
router.get('/orders/recent', (req, res, next) => adminController.getRecentOrders(req, res, next));
router.get('/users', (req, res, next) => adminController.getAllUsers(req, res, next));
router.put('/users/:id/toggle-active', (req, res, next) => adminController.toggleUserActive(req, res, next));
router.get('/notifications', (req, res, next) => adminController.getNotifications(req, res, next));
router.post('/orders/:id/override-status', (req, res, next) =>
  adminController.overrideOrderStatus(req, res, next)
);

export default router;
