import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as capacityService from '../../services/vendorDashboard/capacityService';

export const getCapacity = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = await capacityService.getCapacity(userId!);
  sendResponse(res, { statusCode: 200, success: true, message: 'Capacity fetched successfully', data });
});

export const updateCapacity = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { dailyCapacity, maximumCapacity } = req.body;
  const data = await capacityService.updateCapacity(userId!, { dailyCapacity, maximumCapacity });
  sendResponse(res, { statusCode: 200, success: true, message: 'Capacity updated', data });
});
