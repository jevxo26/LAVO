import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { getVendorByUserId } from './overviewService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmployeeRow {
  id: string;
  employeeId: string; // User.id
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: Date | null;
  status: string;
}

export interface CreateEmployeeData {
  employeeId: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  status?: string;
}

export interface UpdateEmployeeData {
  designation?: string;
  department?: string;
  status?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getEmployees = async (
  userId: string,
  search = '',
): Promise<EmployeeRow[]> => {
  const vendor = await getVendorByUserId(userId);

  const employees = await prisma.vendorEmployee.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  });

  // Join with User to get names / contact info.
  // VendorEmployee.employeeId maps to User.id (no Prisma relation defined).
  const userIds = employees.map((e) => e.employeeId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    },
    select: { id: true, fullName: true, email: true, phone: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // When a search is active, only return employees whose User matched
  const filtered = search
    ? employees.filter((e) => userMap.has(e.employeeId))
    : employees;

  return filtered.map((e) => {
    const u = userMap.get(e.employeeId);
    return {
      id: e.id,
      employeeId: e.employeeId,
      fullName: u?.fullName ?? '',
      email: u?.email ?? '',
      phone: u?.phone ?? '',
      designation: e.designation ?? '',
      department: e.department ?? '',
      joiningDate: e.joiningDate,
      status: e.status,
    };
  });
};

export const createEmployee = async (
  userId: string,
  data: CreateEmployeeData,
) => {
  const vendor = await getVendorByUserId(userId);

  // Verify the referenced user exists
  const user = await prisma.user.findUnique({ where: { id: data.employeeId } });
  if (!user) throw new Error('User not found with the provided employeeId');

  return prisma.vendorEmployee.create({
    data: {
      vendorId: vendor.id,
      employeeId: data.employeeId,
      designation: data.designation ?? null,
      department: data.department ?? null,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
      status: data.status ?? 'ACTIVE',
    },
  });
};

export const updateEmployee = async (
  userId: string,
  recordId: string,
  data: UpdateEmployeeData,
) => {
  const vendor = await getVendorByUserId(userId);
  const emp = await prisma.vendorEmployee.findFirst({
    where: { id: recordId, vendorId: vendor.id },
  });
  if (!emp) throw new Error('Employee not found');

  return prisma.vendorEmployee.update({ where: { id: recordId }, data });
};

export const deleteEmployee = async (userId: string, recordId: string) => {
  const vendor = await getVendorByUserId(userId);
  const emp = await prisma.vendorEmployee.findFirst({
    where: { id: recordId, vendorId: vendor.id },
  });
  if (!emp) throw new Error('Employee not found');

  return prisma.vendorEmployee.delete({ where: { id: recordId } });
};
