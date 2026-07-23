import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

const prisma = new PrismaClient();

export class AdminPermissionController {
  /**
   * GET /api/admin/permissions
   * Retrieves list of all ADMIN users with their dynamic AdminPermission toggles.
   * Protected by requireSuperAdmin
   */
  static getAllAdminPermissions = catchAsync(async (req: Request, res: Response) => {
    const admins = (await prisma.user.findMany({
      where: { userType: "ADMIN" },
      include: { adminPermission: true },
      orderBy: { createdAt: "desc" },
    })) as any[];

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin users with permissions retrieved",
      data: admins,
    });
  });

  /**
   * GET /api/admin/permissions/:adminId
   * Retrieves dynamic permissions for a specific Admin user.
   */
  static getAdminPermissionById = catchAsync(async (req: Request, res: Response) => {
    const adminId = req.params.adminId as string;

    const permissions = await prisma.adminPermission.upsert({
      where: { userId: adminId },
      update: {},
      create: {
        userId: adminId,
        canManageCustomerOps: false,
        canManageBranchOps: false,
        canManageVendorOps: false,
        canManageAgentOps: false,
        canManageEmployeeOps: false,
        canManageFinance: false,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin permission details retrieved",
      data: permissions,
    });
  });

  /**
   * PUT /api/admin/permissions/:adminId
   * Updates boolean permission toggles for a Normal Admin.
   * Protected by requireSuperAdmin
   */
  static updateAdminPermissions = catchAsync(async (req: Request, res: Response) => {
    const adminId = req.params.adminId as string;
    const {
      canManageCustomerOps,
      canManageBranchOps,
      canManageVendorOps,
      canManageAgentOps,
      canManageEmployeeOps,
      canManageFinance,
    } = req.body;

    const updated = await prisma.adminPermission.upsert({
      where: { userId: adminId },
      update: {
        ...(canManageCustomerOps !== undefined && { canManageCustomerOps }),
        ...(canManageBranchOps !== undefined && { canManageBranchOps }),
        ...(canManageVendorOps !== undefined && { canManageVendorOps }),
        ...(canManageAgentOps !== undefined && { canManageAgentOps }),
        ...(canManageEmployeeOps !== undefined && { canManageEmployeeOps }),
        ...(canManageFinance !== undefined && { canManageFinance }),
      },
      create: {
        userId: adminId,
        canManageCustomerOps: !!canManageCustomerOps,
        canManageBranchOps: !!canManageBranchOps,
        canManageVendorOps: !!canManageVendorOps,
        canManageAgentOps: !!canManageAgentOps,
        canManageEmployeeOps: !!canManageEmployeeOps,
        canManageFinance: !!canManageFinance,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin permissions updated successfully",
      data: updated,
    });
  });
}
