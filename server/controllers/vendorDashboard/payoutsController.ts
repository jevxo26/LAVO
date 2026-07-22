import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as payoutsService from '../../services/vendorDashboard/payoutsService';

export const getPayouts = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = (req.query.status as string) || 'ALL';

  const result = await payoutsService.getPayouts(userId!, page, limit, status);
  sendResponse(res, { statusCode: 200, success: true, message: 'Payouts fetched successfully', data: result.data, meta: result.meta });
});

export const requestPayout = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { amount, paymentMethod } = req.body;

  if (!amount || !paymentMethod) {
    res.status(400).json({ success: false, message: 'amount and paymentMethod are required' });
    return;
  }

  const data = await payoutsService.requestPayout(userId!, { amount: Number(amount), paymentMethod });
  sendResponse(res, { statusCode: 201, success: true, message: 'Payout request submitted', data });
});
