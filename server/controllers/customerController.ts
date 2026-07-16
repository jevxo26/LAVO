import { Request, Response } from 'express';
import { CustomerService } from '../services/customerService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

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
}
