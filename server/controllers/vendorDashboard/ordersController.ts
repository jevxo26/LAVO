import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as ordersService from '../../services/vendorDashboard/ordersService';

/** Safely resolve a route param that Express types as string | string[] */
function resolveParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export const getOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const page  = parseInt(resolveParam(req.query.page as string | string[]) ?? '1', 10) || 1;
  const limit = parseInt(resolveParam(req.query.limit as string | string[]) ?? '10', 10) || 10;
  const search = resolveParam(req.query.search as string | string[]) ?? '';
  const status = resolveParam(req.query.status as string | string[]) ?? 'ALL';

  const result = await ordersService.getOrders(userId!, page, limit, search, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId  = req.user?.userId;
  const orderId = resolveParam(req.params.orderId);
  const { status } = req.body;

  if (!orderId) {
    res.status(400).json({ success: false, message: 'Order ID is required' });
    return;
  }
  if (!status) {
    res.status(400).json({ success: false, message: 'Status is required' });
    return;
  }

  const data = await ordersService.updateOrderStatus(userId!, orderId, status);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order status updated', data });
});

export const acceptOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId  = req.user?.userId;
  const orderId = resolveParam(req.params.orderId);

  if (!orderId) {
    res.status(400).json({ success: false, message: 'Order ID is required' });
    return;
  }

  const data = await ordersService.acceptOrder(userId!, orderId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order accepted', data });
});

export const rejectOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId  = req.user?.userId;
  const orderId = resolveParam(req.params.orderId);
  const { reason } = req.body;

  if (!orderId) {
    res.status(400).json({ success: false, message: 'Order ID is required' });
    return;
  }

  const data = await ordersService.rejectOrder(userId!, orderId, reason ?? '');
  sendResponse(res, { statusCode: 200, success: true, message: 'Order rejected', data });
});
