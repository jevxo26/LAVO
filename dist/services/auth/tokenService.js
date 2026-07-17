"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const emailService_1 = require("../emailService");
const prisma = new client_1.PrismaClient();
class TokenService {
}
exports.TokenService = TokenService;
_a = TokenService;
TokenService.forgotPassword = (0, catchServiceAsync_1.catchServiceAsync)(async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('User not found');
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.userToken.create({
        data: { userId: user.id, token: resetPasswordToken, tokenType: 'PASSWORD_RESET', expiresAt }
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    await (0, emailService_1.sendTemplateEmail)(user.email, 'Password Reset Request', 'passwordReset', { name: user.fullName, appName: 'My App', resetLink: resetUrl, year: new Date().getFullYear() });
    return { message: 'Password reset link sent to email' };
});
TokenService.resetPassword = (0, catchServiceAsync_1.catchServiceAsync)(async (token, newPassword) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const userToken = await prisma.userToken.findFirst({
        where: {
            token: hashedToken,
            tokenType: 'PASSWORD_RESET',
            isUsed: false,
            expiresAt: { gt: new Date() },
        },
        include: { user: true }
    });
    if (!userToken || !userToken.user)
        throw new Error('Token is invalid or has expired');
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
    await prisma.user.update({
        where: { id: userToken.userId },
        data: { password: hashedPassword },
    });
    await prisma.userToken.update({
        where: { id: userToken.id },
        data: { isUsed: true }
    });
    return { message: 'Password has been reset successfully' };
});
TokenService.refreshToken = (0, catchServiceAsync_1.catchServiceAsync)(async (refreshToken) => {
    if (!refreshToken)
        throw new Error('Refresh token is required');
    try {
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret)
            throw new Error('JWT_REFRESH_SECRET is not set.');
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        const userToken = await prisma.userToken.findFirst({
            where: { token: refreshToken, userId: decoded.userId, tokenType: 'REFRESH' },
            include: { user: true }
        });
        if (!userToken || !userToken.user)
            throw new Error('Invalid refresh token');
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not set.');
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: userToken.user.id, email: userToken.user.email, role: userToken.user.userType }, jwtSecret, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
        return { token: newAccessToken };
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
});
