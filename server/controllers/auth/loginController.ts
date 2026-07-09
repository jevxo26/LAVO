import { Request, Response } from 'express';
import { LoginService } from '../../services/auth/loginService';
import { TokenService } from '../../services/auth/tokenService';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

export class LoginController {
  static login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      sendResponse(res, { statusCode: 400, message: 'Email and password are required' });
      return;
    }
    const result = await LoginService.loginUser(email, password);
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, { statusCode: 200, message: 'Login successful', data: { user: result.user, token: result.token } });
  });

  static logout = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (userId) {
      await LoginService.logoutUser(userId, req.cookies.refreshToken);
    }
    res.clearCookie('refreshToken');
    sendResponse(res, { statusCode: 200, message: 'Logged out successfully' });
  });

  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      sendResponse(res, { statusCode: 400, message: 'Email is required' });
      return;
    }
    const result = await TokenService.forgotPassword(email);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      sendResponse(res, { statusCode: 400, message: 'Token and new password are required' });
      return;
    }
    const result = await TokenService.resetPassword(token, newPassword);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      sendResponse(res, { statusCode: 401, message: 'Refresh token not found' });
      return;
    }
    const result = await TokenService.refreshToken(refreshToken);
    sendResponse(res, { statusCode: 200, message: 'Token refreshed', data: result });
  });
}
