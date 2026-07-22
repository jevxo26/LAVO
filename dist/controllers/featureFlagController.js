"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagController = void 0;
const featureFlagService_1 = require("../services/featureFlagService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class FeatureFlagController {
}
exports.FeatureFlagController = FeatureFlagController;
_a = FeatureFlagController;
FeatureFlagController.getAllFeatureFlags = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const flags = await featureFlagService_1.FeatureFlagService.getAllFeatureFlags();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Feature flags retrieved successfully",
        data: flags,
    });
});
FeatureFlagController.toggleFeatureFlag = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { isEnabled } = req.body;
    const flag = await featureFlagService_1.FeatureFlagService.toggleFeatureFlag(id, isEnabled);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `Feature flag ${flag.featureName} updated successfully`,
        data: flag,
    });
});
FeatureFlagController.initializeDefaults = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await featureFlagService_1.FeatureFlagService.initializeDefaultFeatureFlags();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Default feature flags initialized successfully",
    });
});
