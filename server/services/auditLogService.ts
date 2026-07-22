import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AuditLogService {
  static async createAuditLog(data: {
    module: string;
    action: string;
    performedBy: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }) {
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

  static async getAllAuditLogs(page: number = 1, limit: number = 20, search: string = "") {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { module: { contains: search, mode: "insensitive" as const } },
            { action: { contains: search, mode: "insensitive" as const } },
            { performedBy: { contains: search, mode: "insensitive" as const } },
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
