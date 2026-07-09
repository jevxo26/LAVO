"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UserService {
    static async getAllUsers(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = {
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
    static async getUserById(id) {
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
    static async createUser(data) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const dataToSave = Object.assign({}, data);
        if (data.password) {
            const saltRounds = 10;
            dataToSave.password = await bcrypt_1.default.hash(data.password, saltRounds);
        }
        const user = await prisma.user.create({
            data: dataToSave,
        });
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return userWithoutPassword;
    }
    static async updateUser(id, data) {
        const dataToUpdate = Object.assign({}, data);
        // Check if updating password
        if (data.password && typeof data.password === 'string') {
            const saltRounds = 10;
            dataToUpdate.password = await bcrypt_1.default.hash(data.password, saltRounds);
        }
        const user = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return userWithoutPassword;
    }
    static async deleteUser(id) {
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
exports.UserService = UserService;
