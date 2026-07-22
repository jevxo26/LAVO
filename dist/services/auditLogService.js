"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuditLogService {
    static async createAuditLog(data) {
        return await prisma.auditLog.create({
            data: {
                module: data.module,
                action: data.action,
                performedBy: data.performedBy,
                oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
                newValue: data.newValue ? JSON.stringify(data.newValue) : null,
                ipAddress: data.ipAddress || null,
            },
        });
    }
    static async getAllAuditLogs(page = 1, limit = 20, search = "") {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { module: { contains: search, mode: "insensitive" } },
                    { action: { contains: search, mode: "insensitive" } },
                    { performedBy: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.auditLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
exports.AuditLogService = AuditLogService;
