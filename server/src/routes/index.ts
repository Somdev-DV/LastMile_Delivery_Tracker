import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';
import agentRoutes from './agent.routes';
import zoneRoutes from './zone.routes';
import rateRoutes from './rate.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/agents', agentRoutes);
router.use('/zones', zoneRoutes);
router.use('/rates', rateRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Last-Mile Delivery Tracker API',
  });
});

export default router;
