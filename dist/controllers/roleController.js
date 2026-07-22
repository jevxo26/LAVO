"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const roleService_1 = require("../services/roleService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class RoleController {
}
exports.RoleController = RoleController;
_a = RoleController;
RoleController.getAllRoles = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const roles = await roleService_1.RoleService.getAllRoles();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Roles and permissions matrix retrieved successfully",
        data: roles,
    });
});
RoleController.createRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const role = await roleService_1.RoleService.createRole(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Custom role created successfully",
        data: role,
    });
});
RoleController.updateRolePermissions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { permissionIds } = req.body;
    const result = await roleService_1.RoleService.updateRolePermissions(id, permissionIds || []);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Role permissions updated successfully",
        data: result,
    });
});
RoleController.assignUserRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id; // userId
    const { roleId } = req.body;
    const result = await roleService_1.RoleService.assignUserRole(id, roleId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User role assigned successfully",
        data: result,
    });
});
RoleController.getAllPermissions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const permissions = await roleService_1.RoleService.getAllPermissions();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "All permissions retrieved successfully",
        data: permissions,
    });
});
