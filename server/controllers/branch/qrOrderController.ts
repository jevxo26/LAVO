import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail } from '../../services/branchDashboardService';

export const assignAgentToOrder = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { orderId, agentId } = req.body;
  if (!orderId || !agentId) throw new Error('orderId and agentId are required');

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');

  // Determine delivery type based on order status
  const isPickup = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';
  const deliveryType = isPickup ? 'PICKUP' : 'DROP_OFF';

  // Update order with the assigned agent and advance status to CONFIRMED
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { 
      [isPickup ? 'pickupAgentId' : 'deliveryAgentId']: agentId,
      ...(order.orderStatus === 'PENDING' ? { orderStatus: 'CONFIRMED' } : {})
    }
  });
  
  // Create or update the delivery record
  // First see if an active delivery exists for this order & type
  let delivery = await prisma.delivery.findFirst({
    where: { orderId: orderId, deliveryType: deliveryType }
  });

  if (delivery) {
    delivery = await prisma.delivery.update({
      where: { id: delivery.id },
      data: { 
        assignedAgentId: agentId,
        deliveryStatus: 'IN_PROGRESS' 
      }
    });
  } else {
    delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        customerId: order.customerId,
        branchId: order.branchId,
        deliveryNumber: `DEL-${Date.now().toString().slice(-6)}-${order.orderNumber || order.id.substring(0,4)}`,
        deliveryType: deliveryType,
        deliveryStatus: 'PENDING',
        assignedAgentId: agentId,
        deliveryAddressId: isPickup ? order.pickupAddressId : order.deliveryAddressId
      }
    });
  }

  sendResponse(res, { statusCode: 200, data: { order: updatedOrder, delivery } });
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
  let items = await prisma.garmentItem.findMany({
    where: { orderItem: { orderId } },
    include: { qrCodeRecord: true }
  });

  // Auto-generate items based on order quantities if this is the first time
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
      // Refetch
      items = await prisma.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: { qrCodeRecord: true }
      });
    }
  }

  sendResponse(res, { statusCode: 200, data: items });
});
