import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail } from '../../services/branchDashboardService';

export const assignAgentToOrder = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { orderId, agentId } = req.body;
  if (!orderId || !agentId) throw new Error('orderId and agentId are required');

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { deliveryAgentId: agentId }
  });
  sendResponse(res, { statusCode: 200, data: order });
});

export const generateQrCode = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { garmentItemId } = req.params;

  const existing = await prisma.garmentQRCode.findUnique({ where: { garmentItemId } });
  if (existing) {
    sendResponse(res, { statusCode: 200, data: existing });
    return;
  }

  const qrCode = `LAVO-${garmentItemId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const record = await prisma.garmentQRCode.create({
    data: { garmentItemId, qrCode, status: 'ACTIVE' }
  });
  sendResponse(res, { statusCode: 201, data: record });
});

export const getOrderQrCodes = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { orderId } = req.params;
  const items = await prisma.garmentItem.findMany({
    where: { orderId },
    include: { qrCodeRecord: true }
  });
  sendResponse(res, { statusCode: 200, data: items });
});
