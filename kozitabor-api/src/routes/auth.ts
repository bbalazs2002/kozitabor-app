import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginLimiter, authController.login);
router.get('/session', requireAuth, authController.getSession);
router.post('/logout', authController.logout);

export default router;