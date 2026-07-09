import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class SettingService {
  static async getAllSettings(page: number = 1, limit: number = 20, category: string = '') {
    const skip = (page - 1) * limit;

    const where: Prisma.SystemSettingWhereInput = {
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
    };

    const [settings, total] = await Promise.all([
      prisma.systemSetting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { category: 'asc' },
      }),
      prisma.systemSetting.count({ where }),
    ]);

    return {
      data: settings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getSettingByKey(settingKey: string) {
    return prisma.systemSetting.findUnique({
      where: { settingKey },
    });
  }

  static async createSetting(data: Prisma.SystemSettingCreateInput) {
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: data.settingKey },
    });

    if (existingSetting) {
      throw new Error(`Setting with key '${data.settingKey}' already exists`);
    }

    return prisma.systemSetting.create({
      data,
    });
  }

  static async updateSetting(settingKey: string, data: Prisma.SystemSettingUpdateInput) {
    return prisma.systemSetting.update({
      where: { settingKey },
      data,
    });
  }

  static async deleteSetting(settingKey: string) {
    return prisma.systemSetting.delete({
      where: { settingKey },
    });
  }
}
