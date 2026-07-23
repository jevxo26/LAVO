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
RegisterController.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await registerService_1.RegisterService.registerUser(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, message: 'User registered successfully', data: user });
});
RegisterController.me = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c, _d;
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.sub);
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const user = await registerService_1.RegisterService.getMe(userId);
    if (!user) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, message: 'User not found' });
        return;
    }
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: user });
});
