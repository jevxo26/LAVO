import { Request, Response } from 'express';
import * as vendorService from '../services/vendorService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await vendorService.getAllVendors(page, limit, search);

  sendResponse(res, { statusCode: 200, success: true, message: 'Vendors fetched successfully', data: result.data, meta: result.meta });
});

export const createVendor = catchAsync(async (req: Request, res: Response) => {
  const vendor = await vendorService.createVendor(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Vendor created successfully', data: vendor });
});

export const updateVendor = catchAsync(async (req: Request, res: Response) => {
  const vendor = await vendorService.updateVendor(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Vendor updated successfully', data: vendor });
});

export const deleteVendor = catchAsync(async (req: Request, res: Response) => {
  await vendorService.deleteVendor(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Vendor deleted successfully' });
});
