"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const registerService_1 = require("../../services/auth/registerService");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
class RegisterController {
}
exports.RegisterController = RegisterController;
_a = RegisterController;
/** POST /auth/register — create user (unverified) + send SMS OTP */
RegisterController.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await registerService_1.RegisterService.registerUser(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Verification code sent to your phone number. Please verify to activate your account.",
        data: user,
    });
});
/** POST /auth/verify-registration-otp — verify 6-digit code */
RegisterController.verifyOtp = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await registerService_1.RegisterService.verifyRegistrationOtp(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Phone verified successfully! Your account is now active. Please sign in.",
        data: user,
    });
});
/** POST /auth/resend-registration-otp — resend code (60s cooldown enforced client-side) */
RegisterController.resendOtp = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await registerService_1.RegisterService.resendRegistrationOtp(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "A new verification code has been sent to your phone number.",
        data: result,
    });
});
/** GET /auth/me — current user (protected) */
RegisterController.me = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c, _d;
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.sub);
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: "Unauthorized" });
        return;
    }
    const user = await registerService_1.RegisterService.getMe(userId);
    if (!user) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, message: "User not found" });
        return;
    }
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: user });
});
