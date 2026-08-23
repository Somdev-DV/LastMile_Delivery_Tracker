import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

// Agent Self Endpoints
router.get('/me', authorize(Role.DELIVERY_AGENT, Role.ADMIN), (req, res, next) =>
  agentController.getMyProfile(req, res, next)
);
router.get('/me/deliveries', authorize(Role.DELIVERY_AGENT, Role.ADMIN), (req, res, next) =>
  agentController.getMyDeliveries(req, res, next)
);
router.get('/me/history', authorize(Role.DELIVERY_AGENT, Role.ADMIN), (req, res, next) =>
  agentController.getMyHistory(req, res, next)
);

// Admin & Shared Endpoints
router.get('/', authorize(Role.ADMIN), (req, res, next) =>
  agentController.getAllAgents(req, res, next)
);
router.get('/available', authorize(Role.ADMIN), (req, res, next) =>
  agentController.getAvailableAgents(req, res, next)
);
router.get('/:id', (req, res, next) => agentController.getAgentProfile(req, res, next));
router.patch(
  '/:id/availability',
  authorize(Role.DELIVERY_AGENT, Role.ADMIN),
  (req, res, next) => agentController.updateAvailability(req, res, next)
);
router.get(
  '/:id/orders',
  authorize(Role.DELIVERY_AGENT, Role.ADMIN),
  (req, res, next) => agentController.getAssignedDeliveries(req, res, next)
);
router.patch('/:id', authorize(Role.ADMIN), (req, res, next) =>
  agentController.updateAgent(req, res, next)
);

export default router;
