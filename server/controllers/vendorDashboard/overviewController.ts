import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as overviewService from '../../services/vendorDashboard/overviewService';

export const getOverview = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = await overviewService.getOverview(userId!);
  sendResponse(res, { statusCode: 200, success: true, message: 'Overview fetched successfully', data });
});
