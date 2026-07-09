import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendTemplateEmail } from '../emailService';

const prisma = new PrismaClient();

export class TokenService {
  static forgotPassword = catchServiceAsync(async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.userToken.create({
      data: { userId: user.id, token: resetPasswordToken, tokenType: 'PASSWORD_RESET', expiresAt }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendTemplateEmail(
      user.email,
      'Password Reset Request',
      'passwordReset',
      { name: user.fullName, appName: 'My App', resetLink: resetUrl, year: new Date().getFullYear() }
    );

    return { message: 'Password reset link sent to email' };
  });

  static resetPassword = catchServiceAsync(async (token: string, newPassword: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const userToken = await prisma.userToken.findFirst({
      where: {
        token: hashedToken,
        tokenType: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true }
    });

    if (!userToken || !userToken.user) throw new Error('Token is invalid or has expired');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

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

  static refreshToken = catchServiceAsync(async (refreshToken: string) => {
    if (!refreshToken) throw new Error('Refresh token is required');

    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
      
      const userToken = await prisma.userToken.findFirst({
        where: { token: refreshToken, userId: decoded.userId, tokenType: 'REFRESH' },
        include: { user: true }
      });

      if (!userToken || !userToken.user) throw new Error('Invalid refresh token');

      const newAccessToken = jwt.sign(
        { userId: userToken.user.id, email: userToken.user.email, role: userToken.user.userType },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any }
      );

      return { token: newAccessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  });
}
