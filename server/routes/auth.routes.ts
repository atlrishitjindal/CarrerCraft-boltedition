import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { signupSchema, loginSchema } from '../utils/validators';

const router = Router();

router.post('/signup', validate(signupSchema), asyncHandler(authController.signup.bind(authController)));
router.post('/login', validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));
router.get('/profile', authenticate, asyncHandler(authController.getProfile.bind(authController)));

export default router;
