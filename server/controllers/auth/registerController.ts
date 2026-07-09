import { Request, Response } from 'express';
import { RegisterService } from '../../services/auth/registerService';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

export class RegisterController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await RegisterService.registerUser(req.body);
    sendResponse(res, { statusCode: 201, message: 'User registered successfully', data: user });
  });

  static me = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }

    const user = await RegisterService.getMe(userId);
    if (!user) {
      sendResponse(res, { statusCode: 404, message: 'User not found' });
      return;
    }

    sendResponse(res, { statusCode: 200, data: user });
  });
}
