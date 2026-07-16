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

    console.log('📝 Registration - password type:', typeof data.password, '| length:', data.password?.length, '| value repr:', JSON.stringify(data.password));

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log('📝 Registration - hashed password (first 20 chars):', hashedPassword.substring(0, 20), '| hash length:', hashedPassword.length);

    // Verify immediately: can we compare back?
    const verifyCheck = await bcrypt.compare(data.password, hashedPassword);
    console.log('📝 Registration - immediate verify check:', verifyCheck);

    // Accept either "name" (from signup form) or "fullName" (direct API calls)
    const fullName: string = data.fullName || data.name;
    if (!fullName) throw new Error('Full name is required');

    const user = await prisma.user.create({
      data: {
        fullName,
        email: data.email,
        phone: data.phone ?? null,
        password: hashedPassword,
        // Public registration is always CUSTOMER.
        // Admins, Branch Managers, and Delivery Agents
        // are created by an Admin via the /api/users endpoint.
        userType: 'CUSTOMER',
      },
    });

    // After creation, read it back and verify
    const readBack = await prisma.user.findUnique({ where: { id: user.id } });
    console.log('📝 Registration - readback password matches stored?', readBack?.password === hashedPassword);
    console.log('📝 Registration - readback password (first 20 chars):', readBack?.password?.substring(0, 20));

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
