"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
class LoginService {
}
exports.LoginService = LoginService;
_a = LoginService;
LoginService.loginUser = (0, catchServiceAsync_1.catchServiceAsync)(async (email, passwordInput) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
        throw new Error('Invalid email or password');
    const isPasswordValid = await bcrypt_1.default.compare(passwordInput, user.password);
    if (!isPasswordValid)
        throw new Error('Invalid email or password');
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.userType }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.userToken.create({
        data: { userId: user.id, token: refreshToken, tokenType: 'REFRESH', expiresAt }
    });
    await prisma.userLoginHistory.create({
        data: { userId: user.id, loginMethod: 'EMAIL', loginStatus: 'SUCCESS' }
    });
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return { user: userWithoutPassword, token, refreshToken };
});
LoginService.logoutUser = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, refreshToken) => {
    if (refreshToken) {
        await prisma.userToken.deleteMany({
            where: { userId, token: refreshToken, tokenType: 'REFRESH' },
        });
    }
    await prisma.userLoginHistory.updateMany({
        where: { userId, logoutTime: null },
        data: { logoutTime: new Date() }
    });
    return { message: 'Logged out successfully' };
});
