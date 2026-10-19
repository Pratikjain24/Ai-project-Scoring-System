// ====================================================
// PROJECTX-RAY AI - AUTHENTICATION ROUTES
// ====================================================

import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, requireRole } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, AuthController.login);
authRouter.post('/token', authRateLimiter, AuthController.login);
authRouter.post('/register', authRateLimiter, AuthController.register);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/revoke', authenticate, AuthController.revoke);
authRouter.get('/public-key', AuthController.getPublicKey);
authRouter.get('/blacklist/status', authenticate, requireRole('ADMIN'), AuthController.getBlacklistStatus);
authRouter.get('/personas', AuthController.getPersonas);
authRouter.get('/me', authenticate, AuthController.getMe);
