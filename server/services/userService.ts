import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UserService {
  static async getAllUsers(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      status: { not: 'INACTIVE' },
      deletedAt: null,
      OR: search
        ? [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          userType: true,
          status: true,
          isVerified: true,
          profileImage: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
        isVerified: true,
        profileImage: true,
        lastLogin: true,
        createdAt: true,
      },
    });
  }

  static async createUser(data: Prisma.UserCreateInput) {
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
  }

  static async updateUser(id: string, data: Prisma.UserUpdateInput) {
    const dataToUpdate = { ...data };
    
    // Check if updating password
    if (data.password && typeof data.password === 'string') {
      const saltRounds = 10;
      dataToUpdate.password = await bcrypt.hash(data.password, saltRounds);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async deleteUser(id: string) {
    // Soft delete: set status to INACTIVE and populate deletedAt
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
    
    return user;
  }
}
