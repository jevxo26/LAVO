import { Request, Response } from 'express';
import * as agentService from '../services/logistics/agentService';
import * as vehicleService from '../services/logistics/vehicleService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

// Agents
export const getAllAgents = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await agentService.getAllAgents(page, limit, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Agents fetched successfully', data: result.data, meta: result.meta });
});

export const createAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = await agentService.createAgent(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Agent created successfully', data: agent });
});

export const updateAgent = catchAsync(async (req: Request, res: Response) => {
  const agent = await agentService.updateAgent(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Agent updated successfully', data: agent });
});

export const deleteAgent = catchAsync(async (req: Request, res: Response) => {
  await agentService.deleteAgent(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Agent deleted successfully' });
});

// Vehicles
export const getAllVehicles = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await vehicleService.getAllVehicles(page, limit, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Vehicles fetched successfully', data: result.data, meta: result.meta });
});

export const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Vehicle created successfully', data: vehicle });
});

export const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Vehicle updated successfully', data: vehicle });
});

export const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  await vehicleService.deleteVehicle(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Vehicle deleted successfully' });
});
