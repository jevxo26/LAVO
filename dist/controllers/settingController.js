"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingController = void 0;
const settingService_1 = require("../services/settingService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class SettingController {
}
exports.SettingController = SettingController;
_a = SettingController;
SettingController.getAllSettings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || '';
    const result = await settingService_1.SettingService.getAllSettings(page, limit, category);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'System settings retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
SettingController.getSettingByKey = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const key = req.params.key;
    const setting = await settingService_1.SettingService.getSettingByKey(key);
    if (!setting) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 404,
            success: false,
            message: 'System setting not found',
            data: null
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'System setting retrieved successfully',
        data: setting,
    });
});
SettingController.createSetting = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const setting = await settingService_1.SettingService.createSetting(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'System setting created successfully',
        data: setting,
    });
});
SettingController.updateSetting = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const key = req.params.key;
    const setting = await settingService_1.SettingService.updateSetting(key, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'System setting updated successfully',
        data: setting,
    });
});
SettingController.deleteSetting = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const key = req.params.key;
    await settingService_1.SettingService.deleteSetting(key);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'System setting deleted successfully',
        data: null
    });
});
