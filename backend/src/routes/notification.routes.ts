import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => notificationController.getMyNotifications(req, res, next));
router.get('/all', authorize(Role.ADMIN), (req, res, next) => notificationController.getAllNotifications(req, res, next));

export default router;
