import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as performanceService from '../../services/vendorDashboard/performanceService';

export const getPerformance = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = await performanceService.getPerformance(userId!);
  sendResponse(res, { statusCode: 200, success: true, message: 'Performance fetched successfully', data });
});
