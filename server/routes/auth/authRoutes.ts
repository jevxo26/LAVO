import { Router } from "express";
import { LoginController } from "../../controllers/auth/loginController";
import { RegisterController } from "../../controllers/auth/registerController";
import { SocialAuthController } from "../../controllers/auth/socialAuthController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = Router();

// ── Registration & Phone OTP Verification ─────────────────────────────────────
router.post("/register", RegisterController.register);
router.post("/verify-registration-otp", RegisterController.verifyOtp);
router.post("/resend-registration-otp", RegisterController.resendOtp);

// ── Login / Session ────────────────────────────────────────────────────────────
router.post("/login", LoginController.login);
router.post("/logout", verifyToken, LoginController.logout);
router.post("/refresh-token", LoginController.refreshToken);
router.post("/forgot-password", LoginController.forgotPassword);
router.post("/reset-password", LoginController.resetPassword);

// ── Current user (protected) ───────────────────────────────────────────────────
router.get("/me", verifyToken, RegisterController.me);

// ── Social Login ───────────────────────────────────────────────────────────────
router.post("/social-login/google", SocialAuthController.loginWithGoogle);
router.post("/social-login/facebook", SocialAuthController.loginWithFacebook);

export default router;
