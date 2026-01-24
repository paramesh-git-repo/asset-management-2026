import { Router } from 'express';
import { loginController, refreshTokenController, logoutController, changePasswordController, updateEmailController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.post('/logout', authenticate, logoutController);
router.post('/change-password', authenticate, changePasswordController);
router.post('/update-email', authenticate, updateEmailController);

export default router;

