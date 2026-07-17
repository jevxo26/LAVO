import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as verificationService from "../../services/deleveryAgent/verificationService";

export const getVerificationList = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result =
      await verificationService.getVerificationList(
        req.user!.userId
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Verification list fetched successfully",
      data: result,
    });
  }
);

export const verifyDeliveryOTP = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const deliveryId  = req.params.deliveryId as string;
    const { otp } = req.body;

    const result =
      await verificationService.verifyDeliveryOTP(
        req.user!.userId,
        deliveryId,
        otp
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  }
);