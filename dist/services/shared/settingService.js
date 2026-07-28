"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SettingService {
    static async getAllSettings(page = 1, limit = 20, category = '') {
        const skip = (page - 1) * limit;
        const where = Object.assign({}, (category ? { category: { equals: category, mode: 'insensitive' } } : {}));
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
    static async getSettingByKey(settingKey) {
        return prisma.systemSetting.findUnique({
            where: { settingKey },
        });
    }
    static async createSetting(data) {
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
    static async updateSetting(settingKey, data) {
        return prisma.systemSetting.update({
            where: { settingKey },
            data,
        });
    }
    static async deleteSetting(settingKey) {
        return prisma.systemSetting.delete({
            where: { settingKey },
        });
    }
}
exports.SettingService = SettingService;
