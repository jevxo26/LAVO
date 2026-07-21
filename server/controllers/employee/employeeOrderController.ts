import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all orders that have been picked up and need QR tagging / processing.
 * Status: PICKUP (garments collected from customer, arrived at branch)
 */
export const getPickupOrders = catchServiceAsync(async (req: any, res: Response) => {
  const userId = req.user?.userId;

  // Find the branch this employee belongs to
  const employee = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true, fullName: true }
  });

  const branchId = employee?.branchId;

  const orders = await prisma.order.findMany({
    where: {
      ...(branchId ? { branchId } : {}),
      orderStatus: { in: ['PICKUP', 'PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING'] }
    },
    include: {
      customer: {
        include: { user: { select: { fullName: true, phone: true } } }
      },
      items: {
        include: {
          garmentType: true,
          garmentItems: {
            include: { qrCodeRecord: true }
          }
        }
      },
      branch: { select: { name: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  const formatted = orders.map(order => {
    const totalGarments = order.items.reduce((sum, item) => sum + item.garmentItems.length, 0);
    const qrGenerated = order.items.reduce(
      (sum, item) => sum + item.garmentItems.filter(g => g.qrCodeRecord).length,
      0
    );

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      customerName: order.customer?.user?.fullName || 'N/A',
      customerPhone: order.customer?.user?.phone || 'N/A',
      branch: order.branch?.name || 'N/A',
      totalGarments,
      qrGenerated,
      allQrDone: totalGarments > 0 && qrGenerated === totalGarments,
      createdAt: order.createdAt,
    };
  });

  sendResponse(res, { statusCode: 200, success: true, message: 'Orders fetched', data: formatted });
});

/**
 * Get garment items with QR codes for a specific order
 */
export const getOrderQrCodes = catchServiceAsync(async (req: any, res: Response) => {
  const { orderId } = req.params;

  let items = await prisma.garmentItem.findMany({
    where: { orderItem: { orderId } },
    include: { qrCodeRecord: true, orderItem: { include: { garmentType: true } } }
  });

  // Auto-create garment item records if they don't exist yet
  if (items.length === 0) {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: { garmentType: true }
    });

    const createPromises = [];
    for (const oi of orderItems) {
      for (let i = 0; i < oi.quantity; i++) {
        createPromises.push(
          prisma.garmentItem.create({
            data: {
              orderItemId: oi.id,
              garmentCode: `G-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              garmentName: oi.garmentType?.name || 'Garment Item',
            }
          })
        );
      }
    }
    if (createPromises.length > 0) {
      await Promise.all(createPromises);
      items = await prisma.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: { qrCodeRecord: true, orderItem: { include: { garmentType: true } } }
      });
    }
  }

  sendResponse(res, { statusCode: 200, success: true, message: 'Garment items fetched', data: items });
});

/**
 * Generate QR code for a single garment item
 */
export const generateQrCode = catchServiceAsync(async (req: any, res: Response) => {
  const { garmentItemId } = req.params;

  const existing = await prisma.garmentQRCode.findUnique({ where: { garmentItemId } });
  if (existing) {
    sendResponse(res, { statusCode: 200, success: true, data: existing });
    return;
  }

  const qrCode = `LAVO-${garmentItemId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const record = await prisma.garmentQRCode.create({
    data: { garmentItemId, qrCode, status: 'ACTIVE' }
  });

  sendResponse(res, { statusCode: 201, success: true, message: 'QR code generated', data: record });
});

/**
 * Generate QR codes for ALL garments in an order at once
 */
export const generateAllQrCodes = catchServiceAsync(async (req: any, res: Response) => {
  const { orderId } = req.params;

  const items = await prisma.garmentItem.findMany({
    where: { orderItem: { orderId } },
    include: { qrCodeRecord: true }
  });

  const created: any[] = [];
  for (const item of items) {
    if (!item.qrCodeRecord) {
      const qrCode = `LAVO-${item.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
      const record = await prisma.garmentQRCode.create({
        data: { garmentItemId: item.id, qrCode, status: 'ACTIVE' }
      });
      created.push(record);
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${created.length} QR code(s) generated`,
    data: created
  });
});
