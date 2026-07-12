import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { catchServiceAsync } from '../../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class RegisterService {
  static registerUser = catchServiceAsync(async (data: any) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Accept either "name" (from signup form) or "fullName" (direct API calls)
    const fullName: string = data.fullName || data.name;
    if (!fullName) throw new Error('Full name is required');

    const user = await prisma.user.create({
      data: {
        fullName,
        email: data.email,
        phone: data.phone ?? null,
        password: hashedPassword,
        userType: data.userType ?? 'CUSTOMER',
      },
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
}
