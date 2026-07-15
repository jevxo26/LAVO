import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail } from '../../services/branchDashboardService';

export const getInventory = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const inventory = await prisma.branchInventory.findMany({ where: { branchId } });
  sendResponse(res, { statusCode: 200, data: inventory });
});

export const createInventory = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const item = await prisma.branchInventory.create({ data: { branchId, ...req.body } });
  sendResponse(res, { statusCode: 201, data: item });
});

export const updateInventory = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const item = await prisma.branchInventory.update({ where: { id: req.params.id }, data: req.body });
  sendResponse(res, { statusCode: 200, data: item });
});

export const deleteInventory = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  await prisma.branchInventory.delete({ where: { id: req.params.id } });
  sendResponse(res, { statusCode: 200, data: { success: true } });
});
