import { Request, Response } from 'express';
import { CustomerService } from '../services/customerService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class CustomerController {
  static getProfileSummary = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getProfileSummary(userId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Profile summary fetched', data: result });
  });

  static getServices = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const result = await CustomerService.getServices(userId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Services fetched', data: result });
  });

  static placeOrder = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.placeOrder(userId, req.body);
    sendResponse(res, { statusCode: 201, success: true, message: 'Order placed successfully', data: result });
  });

  static getOrders = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getOrders(userId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Orders fetched successfully', data: result });
  });

  static getOrderDetails = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getOrderDetails(userId, req.params.id);
    sendResponse(res, { statusCode: 200, success: true, message: 'Order details fetched', data: result });
  });

  static addToWishlist = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.body;
    if (!userId || !serviceId) {
      sendResponse(res, { statusCode: 400, message: 'Missing parameters' });
      return;
    }
    const result = await CustomerService.addToWishlist(userId, serviceId);
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static removeFromWishlist = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.params;
    if (!userId || !serviceId) {
      sendResponse(res, { statusCode: 400, message: 'Missing parameters' });
      return;
    }
    const result = await CustomerService.removeFromWishlist(userId, serviceId);
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static getWishlist = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getWishlist(userId);
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static createTicket = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.createTicket(userId, req.body);
    sendResponse(res, { statusCode: 201, success: true, message: 'Ticket created successfully', data: result });
  });

  static getTickets = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getTickets(userId);
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static getTicketDetails = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getTicketDetails(userId, req.params.id);
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static replyToTicket = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const { message } = req.body;
    if (!userId || !message) {
      sendResponse(res, { statusCode: 400, message: 'Message is required' });
      return;
    }
    const result = await CustomerService.replyToTicket(userId, req.params.id, message);
    sendResponse(res, { statusCode: 201, success: true, message: 'Reply posted', data: result });
  });

  static getFAQs = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerService.getFAQs();
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static getTransactions = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const result = await CustomerService.getTransactions(userId);
    sendResponse(res, { statusCode: 200, success: true, data: result });
  });

  static getDeliveryOTP = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    
    // 1. Check if order belongs to customer
    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true }
    });
    
    if (!order || order.customer.userId !== req.user?.userId) {
      sendResponse(res, { statusCode: 404, success: false, message: 'Order not found', data: null });
      return;
    }
    
    // 2. Find PICKUP delivery (agent coming to collect) - show OTP when order is CONFIRMED
    const pickupDelivery = await prisma.delivery.findFirst({
      where: { orderId: id, deliveryType: 'PICKUP' },
      orderBy: { createdAt: 'desc' }
    });

    let pickupOtpCode: string | null = null;
    if (pickupDelivery) {
      const pickupOtp = await prisma.deliveryOTP.findFirst({
        where: { deliveryId: pickupDelivery.id, isUsed: false },
        orderBy: { createdAt: 'desc' }
      });
      pickupOtpCode = pickupOtp?.otpCode || null;
    }

    // 3. Find DROP_OFF delivery (agent returning clean clothes) - show OTP when READY_FOR_DELIVERY
    const dropoffDelivery = await prisma.delivery.findFirst({
      where: { orderId: id, deliveryType: 'DROP_OFF' },
      orderBy: { createdAt: 'desc' }
    });

    let dropoffOtpCode: string | null = null;
    if (dropoffDelivery) {
      const dropoffOtp = await prisma.deliveryOTP.findFirst({
        where: { deliveryId: dropoffDelivery.id, isUsed: false },
        orderBy: { createdAt: 'desc' }
      });
      dropoffOtpCode = dropoffOtp?.otpCode || null;
    }
    
    sendResponse(res, { 
      statusCode: 200, 
      success: true, 
      message: 'OTP fetched', 
      data: { 
        // Legacy field kept for compatibility
        otpCode: dropoffOtpCode,
        // New separate fields
        pickupOtpCode,
        dropoffOtpCode,
      } 
    });
  });
  static cancelOrder = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }

    // 1. Fetch the order and verify it belongs to this customer
    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!order || order.customer.userId !== userId) {
      sendResponse(res, { statusCode: 404, success: false, message: 'Order not found' });
      return;
    }

    // 2. Only allow cancellation if not yet physically collected by agent
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `Order cannot be cancelled. It is already in "${order.orderStatus}" status. Please contact support.`
      });
      return;
    }

    // 3. Cancel everything in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all delivery records for this order (removes from agent history completely)
      const deliveries = await tx.delivery.findMany({ where: { orderId: id } });
      for (const delivery of deliveries) {
        // Invalidate all OTPs
        await tx.deliveryOTP.updateMany({
          where: { deliveryId: delivery.id },
          data: { isUsed: true }
        });
        // Remove delivery verifications, timelines, logs etc. via cascade
        await tx.delivery.delete({ where: { id: delivery.id } });
      }

      // Cancel the order itself
      await tx.order.update({
        where: { id },
        data: { orderStatus: 'CANCELLED' }
      });

      // Add a timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId: id,
          status: 'CANCELLED',
          description: 'Order was cancelled by the customer.'
        }
      });
    });

    sendResponse(res, { statusCode: 200, success: true, message: 'Order cancelled successfully' });
  });
}
