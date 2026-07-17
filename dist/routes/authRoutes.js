"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginController_1 = require("../controllers/auth/loginController");
const registerController_1 = require("../controllers/auth/registerController");
const socialAuthController_1 = require("../controllers/socialAuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', registerController_1.RegisterController.register);
router.post('/login', loginController_1.LoginController.login);
router.post('/logout', authMiddleware_1.verifyToken, loginController_1.LoginController.logout);
router.post('/refresh-token', loginController_1.LoginController.refreshToken);
router.post('/forgot-password', loginController_1.LoginController.forgotPassword);
router.post('/reset-password', loginController_1.LoginController.resetPassword);
// Get current user (protected route)
router.get('/me', authMiddleware_1.verifyToken, registerController_1.RegisterController.me);
router.post('/social-login/google', socialAuthController_1.SocialAuthController.loginWithGoogle);
router.post('/social-login/facebook', socialAuthController_1.SocialAuthController.loginWithFacebook);
exports.default = router;
