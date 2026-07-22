import { Request, Response } from "express";
import { FeatureFlagService } from "../services/featureFlagService";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

export class FeatureFlagController {
  static getAllFeatureFlags = catchAsync(async (req: Request, res: Response) => {
    const flags = await FeatureFlagService.getAllFeatureFlags();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Feature flags retrieved successfully",
      data: flags,
    });
  });

  static toggleFeatureFlag = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { isEnabled } = req.body;
    const flag = await FeatureFlagService.toggleFeatureFlag(id, isEnabled);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Feature flag ${flag.featureName} updated successfully`,
      data: flag,
    });
  });

  static initializeDefaults = catchAsync(async (req: Request, res: Response) => {
    await FeatureFlagService.initializeDefaultFeatureFlags();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Default feature flags initialized successfully",
    });
  });
}
