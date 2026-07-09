import { Request, Response } from 'express';
import { SettingService } from '../services/settingService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export class SettingController {
  static getAllSettings = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = (req.query.category as string) || '';

    const result = await SettingService.getAllSettings(page, limit, category);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System settings retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  });

  static getSettingByKey = catchAsync(async (req: Request, res: Response) => {
    const key = req.params.key as string;
    const setting = await SettingService.getSettingByKey(key);
    
    if (!setting) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'System setting not found',
        data: null
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System setting retrieved successfully',
      data: setting,
    });
  });

  static createSetting = catchAsync(async (req: Request, res: Response) => {
    const setting = await SettingService.createSetting(req.body);
    
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'System setting created successfully',
      data: setting,
    });
  });

  static updateSetting = catchAsync(async (req: Request, res: Response) => {
    const key = req.params.key as string;
    const setting = await SettingService.updateSetting(key, req.body);
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System setting updated successfully',
      data: setting,
    });
  });

  static deleteSetting = catchAsync(async (req: Request, res: Response) => {
    const key = req.params.key as string;
    await SettingService.deleteSetting(key);
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System setting deleted successfully',
      data: null
    });
  });
}
