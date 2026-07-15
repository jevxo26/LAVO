import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail } from '../../services/branchDashboardService';

export const getEmployees = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const employees = await prisma.branchEmployee.findMany({ where: { branchId } });
  
  const userIds = employees.map((e: any) => e.employeeId);
  const users = await prisma.user.findMany({ 
    where: { id: { in: userIds } }, 
    select: { id: true, fullName: true, email: true } 
  });
  
  const formatted = employees.map((e: any) => {
    const u = users.find((u: any) => u.id === e.employeeId);
    return { ...e, fullName: u?.fullName || '-', email: u?.email || '-' };
  });

  sendResponse(res, { statusCode: 200, data: formatted });
});

export const createEmployee = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const { fullName, email, designation, status } = req.body;
  const user = await prisma.user.create({
    data: { fullName, email, password: 'dummyPassword123', userType: 'Employee' }
  });
  const emp = await prisma.branchEmployee.create({
    data: { branchId, employeeId: user.id, designation, status }
  });
  sendResponse(res, { statusCode: 201, data: emp });
});

export const updateEmployee = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { id } = req.params;
  const { fullName, email, designation, status } = req.body;
  const emp = await prisma.branchEmployee.findUnique({ where: { id } });
  if (emp) {
    await prisma.user.update({ where: { id: emp.employeeId }, data: { fullName, email } });
    await prisma.branchEmployee.update({ where: { id }, data: { designation, status } });
  }
  sendResponse(res, { statusCode: 200, data: { success: true } });
});

export const deleteEmployee = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  await prisma.branchEmployee.delete({ where: { id: req.params.id } });
  sendResponse(res, { statusCode: 200, data: { success: true } });
});
