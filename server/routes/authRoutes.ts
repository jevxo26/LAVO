import { Router } from 'express';
import { LoginController } from '../controllers/auth/loginController';
import { RegisterController } from '../controllers/auth/registerController';
import { SocialAuthController } from '../controllers/socialAuthController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', RegisterController.register);
router.post('/login', LoginController.login);
router.post('/logout', verifyToken, LoginController.logout);
router.post('/refresh-token', LoginController.refreshToken);
router.post('/forgot-password', LoginController.forgotPassword);
router.post('/reset-password', LoginController.resetPassword);

// Get current user (protected route)
router.get('/me', verifyToken, RegisterController.me);

router.post('/social-login/google', SocialAuthController.loginWithGoogle);
router.post('/social-login/facebook', SocialAuthController.loginWithFacebook);

export default router;
