import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as historyService from "../../services/deleveryAgent/historyService";

export const getDeliveryHistory = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await historyService.getDeliveryHistory(
      req.user!.userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Delivery history fetched successfully",
      data: result,
    });
  }
);