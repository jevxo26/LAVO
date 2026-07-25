import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all orders that have been picked up and need QR tagging / processing.
 * Status: PICKUP, PROCESSING, WASHING, DRYING, IRONING, FOLDING
 */
export const getPickupOrders = catchServiceAsync(async (req: any, res: Response) => {
  const userId = req.user?.userId;

  // Find the branch this employee belongs to via BranchEmployee table
  const branchEmployee = await prisma.branchEmployee.findFirst({
    where: { employeeId: userId },
    select: { branchId: true }
  });

  // Find if user is linked to a Vendor
  const vendorRecord = await prisma.vendor.findFirst({
    where: { OR: [{ email: req.user?.email }, { phone: req.user?.phone }] },
    select: { id: true }
  });

  const branchId = branchEmployee?.branchId;
  const vendorId = vendorRecord?.id;

  const orders = await (prisma.order.findMany as any)({
    where: {
      ...(vendorId ? { vendorId } : branchId ? { branchId } : {}),
      orderStatus: { in: ['PICKUP', 'PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING'] }
    },
    include: {
      customer: {
        include: {
          user: { select: { fullName: true, phone: true } },
          addresses: { select: { id: true, receiverName: true, receiverPhone: true, fullAddress: true } }
        }
      },
      items: {
        include: {
          garmentType: true,
          garmentItems: {
            include: { qrCodeRecord: true }
          }
        }
      },
      branch: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const formatted = orders.map((order: any) => {
    const totalGarments = order.items.reduce((sum: number, item: any) => sum + item.garmentItems.length, 0);
    const qrGenerated = order.items.reduce(
      (sum: number, item: any) => sum + item.garmentItems.filter((g: any) => g.qrCodeRecord).length,
      0
    );

    const addr = order.customer?.addresses?.find((a: any) => a.id === order.pickupAddressId) || order.customer?.addresses?.[0];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      customerName: addr?.receiverName || order.customer?.user?.fullName || 'N/A',
      customerPhone: addr?.receiverPhone || order.customer?.user?.phone || 'N/A',
      customerAddress: addr?.fullAddress || 'N/A',
      branch: order.branch?.branchName || 'N/A',
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
    include: {
      qrCodeRecord: true,
      orderItem: { include: { garmentType: true } }
    }
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
              garmentName: (oi.garmentType as any)?.name || 'Garment Item',
            }
          })
        );
      }
    }
    if (createPromises.length > 0) {
      await Promise.all(createPromises);
      items = await prisma.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: {
          qrCodeRecord: true,
          orderItem: { include: { garmentType: true } }
        }
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

  // Ensure garment items exist first
  let items = await prisma.garmentItem.findMany({
    where: { orderItem: { orderId } },
    include: { qrCodeRecord: true }
  });

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
              garmentName: (oi.garmentType as any)?.name || 'Garment Item',
            }
          })
        );
      }
    }
    if (createPromises.length > 0) {
      await Promise.all(createPromises);
      items = await prisma.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: { qrCodeRecord: true }
      });
    }
  }

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

/**
 * GET /employee/garment-status?qrCode=<code>
 * Returns the current status of a garment identified by its QR code.
 * Used by the scanner UI to disable the already-applied stage button.
 */
export const getGarmentStatus = catchServiceAsync(async (req: any, res: Response) => {
  const { qrCode } = req.query as { qrCode: string };

  if (!qrCode) {
    return sendResponse(res, { statusCode: 400, success: false, message: 'qrCode query param is required' });
  }

  const qrRecord = await prisma.garmentQRCode.findUnique({
    where: { qrCode },
    include: {
      garmentItem: {
        select: { status: true, garmentName: true }
      }
    }
  });

  if (!qrRecord || !qrRecord.garmentItem) {
    return sendResponse(res, { statusCode: 404, success: false, message: 'QR code not found' });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Garment status retrieved',
    data: {
      status: qrRecord.garmentItem.status,
      garmentName: qrRecord.garmentItem.garmentName,
    }
  });
});
