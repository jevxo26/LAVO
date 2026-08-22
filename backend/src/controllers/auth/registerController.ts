import { Request, Response } from "express";
import { RegisterService } from "../../services/auth/registerService";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

export class RegisterController {
  /** POST /auth/register — create user (unverified) + send SMS OTP */
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await RegisterService.registerUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Verification code sent to your phone number. Please verify to activate your account.",
      data: user,
    });
  });

  /** POST /auth/verify-registration-otp — verify 6-digit code */
  static verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const user = await RegisterService.verifyRegistrationOtp(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Phone verified successfully! Your account is now active. Please sign in.",
      data: user,
    });
  });

  /** POST /auth/resend-registration-otp — resend code (60s cooldown enforced client-side) */
  static resendOtp = catchAsync(async (req: Request, res: Response) => {
    const result = await RegisterService.resendRegistrationOtp(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "A new verification code has been sent to your phone number.",
      data: result,
    });
  });

  /** GET /auth/me — current user (protected) */
  static me = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: "Unauthorized" });
      return;
    }
    const user = await RegisterService.getMe(userId);
    if (!user) {
      sendResponse(res, { statusCode: 404, message: "User not found" });
      return;
    }
    sendResponse(res, { statusCode: 200, success: true, data: user });
  });
}
