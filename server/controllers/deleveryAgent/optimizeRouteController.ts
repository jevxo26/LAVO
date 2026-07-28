import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthRequest } from "../../middlewares/authMiddleware";
import * as optimizeRouteService from "../../services/deleveryAgent/optimizeRouteService";

export const getOptimizedRoutes = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const agentLon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const result =
      await optimizeRouteService.getOptimizedRoutes(
        userId,
        agentLat,
        agentLon
      );


    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Optimized routes fetched successfully",
      data: result,
    });
  }
);