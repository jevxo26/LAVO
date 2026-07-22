import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as servicesService from '../../services/vendorDashboard/servicesService';

/** Express route params are typed as string | string[] — resolve to plain string. */
function resolveParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export const getServices = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = await servicesService.getServices(userId!);
  sendResponse(res, { statusCode: 200, success: true, message: 'Services fetched successfully', data });
});

export const updateService = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const serviceId = resolveParam(req.params.serviceId);

  if (!serviceId) {
    res.status(400).json({ success: false, message: 'Service ID is required' });
    return;
  }

  const data = await servicesService.updateService(userId!, serviceId, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Service updated', data });
});

export const toggleServiceStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const serviceId = resolveParam(req.params.serviceId);

  if (!serviceId) {
    res.status(400).json({ success: false, message: 'Service ID is required' });
    return;
  }

  const data = await servicesService.toggleServiceStatus(userId!, serviceId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Service status toggled', data });
});
