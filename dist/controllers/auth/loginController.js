"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const loginService_1 = require("../../services/auth/loginService");
const tokenService_1 = require("../../services/auth/tokenService");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
class LoginController {
}
exports.LoginController = LoginController;
_a = LoginController;
LoginController.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Email and password are required' });
        return;
    }
    const result = await loginService_1.LoginService.loginUser(email, password);
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: 'Login successful', data: { user: result.user, token: result.token } });
});
LoginController.logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (userId) {
        await loginService_1.LoginService.logoutUser(userId, req.cookies.refreshToken);
    }
    res.clearCookie('refreshToken');
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: 'Logged out successfully' });
});
LoginController.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Email is required' });
        return;
    }
    const result = await tokenService_1.TokenService.forgotPassword(email);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: result.message });
});
LoginController.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Token and new password are required' });
        return;
    }
    const result = await tokenService_1.TokenService.resetPassword(token, newPassword);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: result.message });
});
LoginController.refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Refresh token not found' });
        return;
    }
    const result = await tokenService_1.TokenService.refreshToken(refreshToken);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: 'Token refreshed', data: result });
});
