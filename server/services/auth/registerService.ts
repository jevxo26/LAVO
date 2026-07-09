import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { catchServiceAsync } from '../../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class RegisterService {
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
}
