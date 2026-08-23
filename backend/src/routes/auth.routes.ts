import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));
router.patch('/profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));

export default router;
