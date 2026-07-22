import { Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import * as employeesService from '../../services/vendorDashboard/employeesService';

/** Express route params are typed as string | string[] — resolve to plain string. */
function resolveParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export const getEmployees = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const search = resolveParam(req.query.search as string | string[]) ?? '';
  const data = await employeesService.getEmployees(userId!, search);
  sendResponse(res, { statusCode: 200, success: true, message: 'Employees fetched successfully', data });
});

export const createEmployee = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const data = await employeesService.createEmployee(userId!, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Employee created', data });
});

export const updateEmployee = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const id = resolveParam(req.params.id);

  if (!id) {
    res.status(400).json({ success: false, message: 'Employee ID is required' });
    return;
  }

  const data = await employeesService.updateEmployee(userId!, id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Employee updated', data });
});

export const deleteEmployee = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const id = resolveParam(req.params.id);

  if (!id) {
    res.status(400).json({ success: false, message: 'Employee ID is required' });
    return;
  }

  await employeesService.deleteEmployee(userId!, id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Employee deleted', data: null });
});
