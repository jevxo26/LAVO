"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoleService {
    static async getAllRoles() {
        return await prisma.role.findMany({
            where: { deletedAt: null },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
    }
    static async createRole(data) {
        const formattedName = data.name.toUpperCase().replace(/\s+/g, "_");
        const existing = await prisma.role.findUnique({
            where: { name: formattedName },
        });
        if (existing) {
            throw new Error("Role already exists");
        }
        return await prisma.role.create({
            data: {
                name: formattedName,
                displayName: data.displayName,
                description: data.description,
                roleType: "ADMIN",
            },
        });
    }
    static async updateRolePermissions(roleId, permissionIds) {
        // Delete existing permissions for this role
        await prisma.rolePermission.deleteMany({
            where: { roleId },
        });
        // Create new permissions links
        const createData = permissionIds.map((pId) => ({
            roleId,
            permissionId: pId,
        }));
        await prisma.rolePermission.createMany({
            data: createData,
        });
        return { success: true, count: createData.length };
    }
    static async assignUserRole(userId, roleId) {
        // Find role
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new Error("Role not found");
        }
        // Update user's type to match role name
        await prisma.user.update({
            where: { id: userId },
            data: { userType: role.name },
        });
        return await prisma.userRole.upsert({
            where: { userId_roleId: { userId, roleId } },
            update: {},
            create: { userId, roleId },
        });
    }
    static async getAllPermissions() {
        return await prisma.permission.findMany({
            orderBy: [{ module: "asc" }, { action: "asc" }],
        });
    }
}
exports.RoleService = RoleService;
