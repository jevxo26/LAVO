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
    console.log('🔐 Login attempt - email:', email);
    console.log('🔐 passwordInput type:', typeof passwordInput, '| length:', passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.length, '| value repr:', JSON.stringify(passwordInput));
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('🔐 User fetched from DB:', user ? { id: user.id, email: user.email, userType: user.userType, status: user.status, hasPassword: !!user.password } : 'NOT FOUND');
    if (!user || !user.password) {
        console.log('🔐 FAIL: user not found or no password stored');
        throw new Error('Invalid email or password');
    }
    console.log('🔐 Stored hash (first 20 chars):', user.password.substring(0, 20), '| hash length:', user.password.length);
    // Direct manual test: hash the input again and compare
    const manualHash = await bcrypt_1.default.hash(passwordInput, 10);
    console.log('🔐 Manual hash of input (for reference):', manualHash.substring(0, 20));
    const isPasswordValid = await bcrypt_1.default.compare(passwordInput, user.password);
    console.log('🔐 bcrypt.compare result:', isPasswordValid);
    if (!isPasswordValid) {
        // Additional debug: try trimmed password
        const trimmedResult = await bcrypt_1.default.compare(passwordInput.trim(), user.password);
        console.log('🔐 bcrypt.compare with TRIMMED input:', trimmedResult);
        console.log('🔐 FAIL at bcrypt.compare — password mismatch');
        throw new Error('Invalid email or password');
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
        throw new Error('JWT_SECRET is not set.');
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.userType }, jwtSecret, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret)
        throw new Error('JWT_REFRESH_SECRET is not set.');
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, refreshSecret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') });
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
