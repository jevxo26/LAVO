"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const prisma = new client_1.PrismaClient();
class AdminUserController {
}
exports.AdminUserController = AdminUserController;
_a = AdminUserController;
/**
 * GET /api/admin/users
 * Allowed for SUPER_ADMIN & ADMIN (Read-only view for Normal Admins)
 */
AdminUserController.getUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const roleFilter = req.query.role || undefined;
    const skip = (page - 1) * limit;
    const where = roleFilter ? { userType: roleFilter.toUpperCase() } : {};
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                userType: true,
                status: true,
                isVerified: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
    ]);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Users directory retrieved successfully",
        data: users,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
});
/**
 * POST /api/admin/users
 * Strictly SUPER_ADMIN only
 */
AdminUserController.createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { fullName, email, phone, password, userType } = req.body;
    const user = await prisma.user.create({
        data: {
            fullName,
            email,
            phone,
            password: password || "ChangeMe123!",
            userType: userType ? userType.toUpperCase() : "CUSTOMER",
            status: "ACTIVE",
        },
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User account created successfully",
        data: user,
    });
});
/**
 * PUT /api/admin/users/:id
 * Strictly SUPER_ADMIN only
 */
AdminUserController.updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { fullName, phone, userType, status } = req.body;
    const updated = await prisma.user.update({
        where: { id },
        data: Object.assign(Object.assign(Object.assign(Object.assign({}, (fullName && { fullName })), (phone && { phone })), (userType && { userType: userType.toUpperCase() })), (status && { status: status.toUpperCase() })),
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User profile updated successfully",
        data: updated,
    });
});
/**
 * PATCH /api/admin/users/:id/ban
 * Strictly SUPER_ADMIN only
 */
AdminUserController.banUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { isBanned } = req.body;
    const updated = await prisma.user.update({
        where: { id },
        data: { status: isBanned ? "BANNED" : "ACTIVE" },
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `User account ${isBanned ? "banned" : "reactivated"} successfully`,
        data: updated,
    });
});
/**
 * DELETE /api/admin/users/:id
 * Strictly SUPER_ADMIN only
 */
AdminUserController.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    await prisma.user.delete({ where: { id } });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User account deleted successfully",
    });
});
