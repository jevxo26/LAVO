import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const selectUser = { id: true, fullName: true, email: true, phone: true, userType: true, status: true, isVerified: true, profileImage: true, lastLogin: true, createdAt: true };

export class UserService {
  static async getAllUsers(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      status: { not: 'INACTIVE' }, deletedAt: null,
      OR: search ? [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search, mode: 'insensitive' } }] : undefined,
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: selectUser }),
      prisma.user.count({ where }),
    ]);
    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id, deletedAt: null }, select: selectUser });
  }

  static async createUser(data: any) {
    const email = data.email;
    if (await prisma.user.findUnique({ where: { email } })) throw new Error('User already exists with this email');
    
    const dataToSave: any = {
      fullName: data.name || data.fullName,
      email: data.email,
      phone: data.phone,
      userType: data.role ? data.role.toUpperCase().replace(' ', '_') : (data.userType || 'CUSTOMER'),
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    };
    
    const plainPassword = data.password || 'Lavo@1234';
    dataToSave.password = await bcrypt.hash(plainPassword, 10);
    
    const { password, ...userWithoutPassword } = await prisma.user.create({ data: dataToSave });
    return userWithoutPassword;
  }

  static async updateUser(id: string, data: any) {
    const dataToUpdate: any = {};
    if (data.name) dataToUpdate.fullName = data.name;
    if (data.email) dataToUpdate.email = data.email;
    if (data.phone) dataToUpdate.phone = data.phone;
    if (data.role) dataToUpdate.userType = data.role.toUpperCase().replace(' ', '_');
    if (data.status) dataToUpdate.status = data.status.toUpperCase();
    
    if (data.password && typeof data.password === 'string') {
      dataToUpdate.password = await bcrypt.hash(data.password, 10);
    }
    
    const { password, ...userWithoutPassword } = await prisma.user.update({ where: { id }, data: dataToUpdate });
    return userWithoutPassword;
  }

  static async deleteUser(id: string) {
    return await prisma.user.update({ where: { id }, data: { status: 'INACTIVE', deletedAt: new Date() } });
  }
}
