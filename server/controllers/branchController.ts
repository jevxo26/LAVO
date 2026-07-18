import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import * as branchService from '../services/branchService';

export const getAllBranches = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  const result = await branchService.getAllBranches(page, limit, search);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Branches retrieved successfully',
    data: result.data,
    meta: result.meta
  });
});

export const getBranchById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const branch = await branchService.getBranchById(id);

  if (!branch) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Branch not found',
      data: null
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Branch retrieved successfully',
    data: branch
  });
});

import { z } from 'zod';

const createBranchSchema = z.object({
  branchCode: z.string().optional(),
  branchName: z.string().min(1, "Branch name cannot be empty"),
  location: z.string().optional(),
  contact: z.string().optional(),
  manager: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const createBranch = catchAsync(async (req: Request, res: Response) => {
  const validatedData = createBranchSchema.parse(req.body);
  const branch = await branchService.createBranch(validatedData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Branch created successfully',
    data: branch
  });
});

export const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const branch = await branchService.updateBranch(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Branch updated successfully',
    data: branch
  });
});

export const deleteBranch = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await branchService.deleteBranch(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Branch deleted successfully',
    data: null
  });
});
