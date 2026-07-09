import { Request, Response } from 'express';
import * as laundryService from '../services/laundryService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await laundryService.getAllServices(page, limit, search);

  sendResponse(res, { statusCode: 200, success: true, message: 'Services fetched successfully', data: result.data, meta: result.meta });
});

export const createService = catchAsync(async (req: Request, res: Response) => {
  const service = await laundryService.createService(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Service created successfully', data: service });
});

export const updateService = catchAsync(async (req: Request, res: Response) => {
  const service = await laundryService.updateService(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Service updated successfully', data: service });
});

export const deleteService = catchAsync(async (req: Request, res: Response) => {
  await laundryService.deleteService(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Service deleted successfully' });
});
