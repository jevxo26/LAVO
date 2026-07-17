"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await userService_1.UserService.getAllUsers(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
UserController.getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const user = await userService_1.UserService.getUserById(id);
    if (!user) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 404,
            success: false,
            message: 'User not found',
            data: null
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'User retrieved successfully',
        data: user,
    });
});
UserController.createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await userService_1.UserService.createUser(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'User created successfully',
        data: user,
    });
});
UserController.updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const user = await userService_1.UserService.updateUser(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'User updated successfully',
        data: user,
    });
});
UserController.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    await userService_1.UserService.deleteUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'User deleted successfully',
        data: null
    });
});
