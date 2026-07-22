import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as walletService from '../../services/vendorDashboard/walletService';

export const getWallet = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = await walletService.getWallet(userId!);
  sendResponse(res, { statusCode: 200, success: true, message: 'Wallet fetched successfully', data });
});
