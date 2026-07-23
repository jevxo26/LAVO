import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

const prisma = new PrismaClient();

export class AdminUserController {
  /**
   * GET /api/admin/users
   * Allowed for SUPER_ADMIN & ADMIN (Read-only view for Normal Admins)
   */
  static getUsers = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const roleFilter = (req.query.role as string) || undefined;
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

    sendResponse(res, {
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
  static createUser = catchAsync(async (req: Request, res: Response) => {
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

    sendResponse(res, {
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
  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { fullName, phone, userType, status } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(userType && { userType: userType.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
      },
    });

    sendResponse(res, {
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
  static banUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { isBanned } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { status: isBanned ? "BANNED" : "ACTIVE" },
    });

    sendResponse(res, {
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
  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User account deleted successfully",
    });
  });
}
