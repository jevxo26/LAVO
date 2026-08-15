import { Response } from "express";
import { catchServiceAsync } from "../../utils/catchServiceAsync";
import { sendResponse } from "../../utils/sendResponse";
import prisma, { getBranchOrFail } from "../../services/branch-manager/branchDashboardService";
import { DeliveryAssignmentService } from "../../services/agent/deliveryAssignmentService";

export const getOrders = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const orders = await prisma.order.findMany({
    where: { branchId },
    include: {
      customer: { include: { user: true } },
      vendor: { select: { id: true, businessName: true, vendorCode: true } },
      items: { include: { service: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  sendResponse(res, { statusCode: 200, data: orders });
});

export const markOrderReadyForDelivery = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const { orderId } = req.params;

  const order = await prisma.order.findFirst({ where: { id: orderId, branchId } });
  if (!order) throw new Error('Order not found or does not belong to your branch');

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: 'READY_FOR_DELIVERY' }
  });

  await prisma.orderTimeline.create({
    data: {
      orderId,
      status: 'READY_FOR_DELIVERY',
      description: 'Your laundry is packed and ready for delivery agent dispatch.',
    }
  }).catch(() => {});

  try {
    const { getIO } = await import("../../sockets/socket");
    const io = getIO();
    if (io) {
      io.to(`order_${orderId}`).emit("order_status_updated", {
        orderId,
        orderStatus: "READY_FOR_DELIVERY",
        status: "READY_FOR_DELIVERY",
      });
    }
  } catch (e) {}

  // Automatically trigger the drop-off delivery engine
  const delivery = await DeliveryAssignmentService.autoAssignDropoffDelivery(orderId);

  sendResponse(res, { statusCode: 200, data: { orderId, delivery } });
});

export const getDevOTP = catchServiceAsync(async (req: any, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    sendResponse(res, { statusCode: 403, data: { message: "Dev OTP endpoint is disabled in production" } });
    return;
  }
  const { orderId } = req.params;
  const delivery = await prisma.delivery.findFirst({
    where: { orderId, deliveryType: 'DROP_OFF' },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!delivery) {
    sendResponse(res, { statusCode: 200, data: { otpCode: null, message: "No drop-off delivery found" } });
    return;
  }
  
  const otp = await prisma.deliveryOTP.findFirst({
    where: { deliveryId: delivery.id },
    orderBy: { createdAt: 'desc' }
  });
  
  sendResponse(res, { statusCode: 200, data: { otpCode: otp?.otpCode || null, message: otp ? "OTP found" : "No OTP found" } });
});
