import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthRequest } from "../../middlewares/authMiddleware";
import * as availableDeliveriesService from '../../services/deleveryAgent/availableDeliveriesService'

export const getAvailableDeliveries = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    const result =
      await availableDeliveriesService.getAvailableDeliveries(
        userId!
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Available deliveries fetched successfully",
      data: result,
    });
  }
);

export const acceptDelivery = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const deliveryId = req.params.deliveryId as string;

    const result =
      await availableDeliveriesService.acceptDelivery(
        userId,
        deliveryId
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Delivery accepted successfully",
      data: result,
    });
  }
);