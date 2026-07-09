import { Request, Response } from 'express';
import * as ticketService from '../services/support/ticketService';
import * as reviewService from '../services/support/reviewService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

// Tickets
export const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await ticketService.getAllTickets(page, limit, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tickets fetched successfully', data: result.data, meta: result.meta });
});

export const createTicket = catchAsync(async (req: Request, res: Response) => {
  const ticket = await ticketService.createTicket(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Ticket created successfully', data: ticket });
});

export const updateTicket = catchAsync(async (req: Request, res: Response) => {
  const ticket = await ticketService.updateTicket(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Ticket updated successfully', data: ticket });
});

export const deleteTicket = catchAsync(async (req: Request, res: Response) => {
  await ticketService.deleteTicket(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Ticket deleted successfully' });
});

// Reviews
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await reviewService.getAllReviews(page, limit, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Reviews fetched successfully', data: result.data, meta: result.meta });
});

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Review created successfully', data: review });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewService.updateReview(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Review updated successfully', data: review });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Review deleted successfully' });
});
