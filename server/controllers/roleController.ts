import { Request, Response } from "express";
import { RoleService } from "../services/roleService";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

export class RoleController {
  static getAllRoles = catchAsync(async (req: Request, res: Response) => {
    const roles = await RoleService.getAllRoles();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Roles and permissions matrix retrieved successfully",
      data: roles,
    });
  });

  static createRole = catchAsync(async (req: Request, res: Response) => {
    const role = await RoleService.createRole(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Custom role created successfully",
      data: role,
    });
  });

  static updateRolePermissions = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { permissionIds } = req.body;
    const result = await RoleService.updateRolePermissions(id, permissionIds || []);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Role permissions updated successfully",
      data: result,
    });
  });

  static assignUserRole = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string; // userId
    const { roleId } = req.body;
    const result = await RoleService.assignUserRole(id, roleId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User role assigned successfully",
      data: result,
    });
  });

  static getAllPermissions = catchAsync(async (req: Request, res: Response) => {
    const permissions = await RoleService.getAllPermissions();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All permissions retrieved successfully",
      data: permissions,
    });
  });
}
