import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { catchServiceAsync } from '../../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class LoginService {
  static loginUser = catchServiceAsync(async (email: string, passwordInput: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET is not set.');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.userType },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is not set.');
    const refreshToken = jwt.sign(
      { userId: user.id },
      refreshSecret,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );

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

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token, refreshToken };
  });

  static logoutUser = catchServiceAsync(async (userId: string, refreshToken?: string) => {
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
}
