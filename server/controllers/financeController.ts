import { Request, Response } from 'express';
import * as taxService from '../services/finance/taxService';
import * as deliveryChargeService from '../services/finance/deliveryChargeService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

// Taxes
export const getAllTaxes = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await taxService.getAllTaxes(page, limit, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Taxes fetched successfully', data: result.data, meta: result.meta });
});

export const createTax = catchAsync(async (req: Request, res: Response) => {
  const tax = await taxService.createTax(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Tax created successfully', data: tax });
});

export const updateTax = catchAsync(async (req: Request, res: Response) => {
  const tax = await taxService.updateTax(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tax updated successfully', data: tax });
});

export const deleteTax = catchAsync(async (req: Request, res: Response) => {
  await taxService.deleteTax(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tax deleted successfully' });
});

// Delivery Charges
export const getAllDeliveryCharges = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await deliveryChargeService.getAllDeliveryCharges(page, limit, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Delivery charges fetched successfully', data: result.data, meta: result.meta });
});

export const createDeliveryCharge = catchAsync(async (req: Request, res: Response) => {
  const charge = await deliveryChargeService.createDeliveryCharge(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Delivery charge created successfully', data: charge });
});

export const updateDeliveryCharge = catchAsync(async (req: Request, res: Response) => {
  const charge = await deliveryChargeService.updateDeliveryCharge(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Delivery charge updated successfully', data: charge });
});

export const deleteDeliveryCharge = catchAsync(async (req: Request, res: Response) => {
  await deliveryChargeService.deleteDeliveryCharge(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Delivery charge deleted successfully' });
});
