"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPermissionController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const prisma = new client_1.PrismaClient();
class AdminPermissionController {
}
exports.AdminPermissionController = AdminPermissionController;
_a = AdminPermissionController;
/**
 * GET /api/admin/permissions
 * Retrieves list of all ADMIN users with their dynamic AdminPermission toggles.
 * Protected by requireSuperAdmin
 */
AdminPermissionController.getAllAdminPermissions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const admins = (await prisma.user.findMany({
        where: { userType: "ADMIN" },
        include: { adminPermission: true },
        orderBy: { createdAt: "desc" },
    }));
    (0, sendResponse_1.sendResponse)(res, {
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
AdminPermissionController.getAdminPermissionById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.params.adminId;
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
    (0, sendResponse_1.sendResponse)(res, {
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
AdminPermissionController.updateAdminPermissions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.params.adminId;
    const { canManageCustomerOps, canManageBranchOps, canManageVendorOps, canManageAgentOps, canManageEmployeeOps, canManageFinance, } = req.body;
    const updated = await prisma.adminPermission.upsert({
        where: { userId: adminId },
        update: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (canManageCustomerOps !== undefined && { canManageCustomerOps })), (canManageBranchOps !== undefined && { canManageBranchOps })), (canManageVendorOps !== undefined && { canManageVendorOps })), (canManageAgentOps !== undefined && { canManageAgentOps })), (canManageEmployeeOps !== undefined && { canManageEmployeeOps })), (canManageFinance !== undefined && { canManageFinance })),
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
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Admin permissions updated successfully",
        data: updated,
    });
});
