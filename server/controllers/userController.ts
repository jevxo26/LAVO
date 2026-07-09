import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export class UserController {
  static getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await UserService.getAllUsers(page, limit, search);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  });

  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await UserService.getUserById(id);
    
    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'User not found',
        data: null
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });

  static createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await UserService.updateUser(id, req.body);
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await UserService.deleteUser(id);
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  });
}
