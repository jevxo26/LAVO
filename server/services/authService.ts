import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { catchServiceAsync } from '../utils/catchServiceAsync';
import { sendTemplateEmail } from './emailService';

const prisma = new PrismaClient();

export class AuthService {
  static registerUser = catchServiceAsync(async (data: Prisma.UserCreateInput) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const dataToSave = { ...data };
    if (data.password) {
      const saltRounds = 10;
      dataToSave.password = await bcrypt.hash(data.password, saltRounds);
    }

    const user = await prisma.user.create({
      data: dataToSave,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  static getMe = catchServiceAsync(async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return user;
  });

  static loginUser = catchServiceAsync(async (email: string, passwordInput: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );

    // Save refresh token in UserToken table
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.userToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        tokenType: 'REFRESH',
        expiresAt,
      }
    });

    // Create a login history record
    await prisma.userLoginHistory.create({
      data: {
        userId: user.id,
        loginMethod: 'EMAIL',
        loginStatus: 'SUCCESS',
      }
    });

    // Update lastLogin timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  });

  static forgotPassword = catchServiceAsync(async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.userToken.create({
      data: {
        userId: user.id,
        token: resetPasswordToken,
        tokenType: 'PASSWORD_RESET',
        expiresAt,
      }
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

    if (!userToken || !userToken.user) {
      throw new Error('Token is invalid or has expired');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userToken.userId },
      data: {
        password: hashedPassword,
      },
    });

    // Mark token as used
    await prisma.userToken.update({
      where: { id: userToken.id },
      data: { isUsed: true }
    });

    return { message: 'Password has been reset successfully' };
  });

  static refreshToken = catchServiceAsync(async (refreshToken: string) => {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
      
      const userToken = await prisma.userToken.findFirst({
        where: { 
          token: refreshToken,
          userId: decoded.userId,
          tokenType: 'REFRESH'
        },
        include: { user: true }
      });

      if (!userToken || !userToken.user) {
        throw new Error('Invalid refresh token');
      }

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

  static logoutUser = catchServiceAsync(async (userId: string, refreshToken?: string) => {
    if (refreshToken) {
      await prisma.userToken.deleteMany({
        where: { 
          userId,
          token: refreshToken,
          tokenType: 'REFRESH'
        },
      });
    }
    
    // Also log out the history
    await prisma.userLoginHistory.updateMany({
      where: { userId, logoutTime: null },
      data: { logoutTime: new Date() }
    });

    return { message: 'Logged out successfully' };
  });
}
