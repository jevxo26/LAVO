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
const selectUser = { id: true, fullName: true, email: true, phone: true, userType: true, status: true, isVerified: true, profileImage: true, lastLogin: true, createdAt: true };
class UserService {
    static async getAllUsers(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = {
            status: { not: 'INACTIVE' }, deletedAt: null,
            OR: search ? [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search, mode: 'insensitive' } }] : undefined,
        };
        const [users, total] = await Promise.all([
            prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: selectUser }),
            prisma.user.count({ where }),
        ]);
        const mappedUsers = users.map(user => (Object.assign(Object.assign({}, user), { name: user.fullName, role: user.userType })));
        return { data: mappedUsers, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    static async getUserById(id) {
        const user = await prisma.user.findUnique({ where: { id, deletedAt: null }, select: selectUser });
        if (!user)
            return null;
        return Object.assign(Object.assign({}, user), { name: user.fullName, role: user.userType });
    }
    static async createUser(data) {
        const email = data.email;
        if (await prisma.user.findUnique({ where: { email } }))
            throw new Error('User already exists with this email');
        if (data.phone) {
            if (await prisma.user.findUnique({ where: { phone: data.phone } }))
                throw new Error('User already exists with this phone number');
        }
        const dataToSave = {
            fullName: data.name || data.fullName,
            email: data.email,
            phone: data.phone,
            userType: data.role ? data.role.toUpperCase().replace(' ', '_') : (data.userType || 'CUSTOMER'),
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        };
        const plainPassword = data.password || 'Laundrix@1234';
        dataToSave.password = await bcrypt_1.default.hash(plainPassword, 10);
        const _a = await prisma.user.create({ data: dataToSave }), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
        return userWithoutPassword;
    }
    // static async updateUser(id: string, data: any) {
    //   const dataToUpdate: any = {};
    //   if (data.name) dataToUpdate.fullName = data.name;
    //   if (data.email) dataToUpdate.email = data.email;
    //   if (data.phone) dataToUpdate.phone = data.phone;
    //   if (data.role) dataToUpdate.userType = data.role.toUpperCase().replace(' ', '_');
    //   if (data.status) dataToUpdate.status = data.status.toUpperCase();
    //   if (data.password && typeof data.password === 'string') {
    //     dataToUpdate.password = await bcrypt.hash(data.password, 10);
    //   }
    //   const { password, ...userWithoutPassword } = await prisma.user.update({ where: { id }, data: dataToUpdate });
    //   return userWithoutPassword;
    // }
    static async updateUser(id, data) {
        const dataToUpdate = {};
        if (data.name)
            dataToUpdate.fullName = data.name;
        if (data.email)
            dataToUpdate.email = data.email;
        if (data.phone)
            dataToUpdate.phone = data.phone;
        if (data.role)
            dataToUpdate.userType = data.role.toUpperCase().replace(' ', '_');
        if (data.status)
            dataToUpdate.status = data.status.toUpperCase();
        if (data.password && typeof data.password === 'string') {
            dataToUpdate.password = await bcrypt_1.default.hash(data.password, 10);
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
        if (updatedUser.userType === "DELIVERY_AGENT") {
            const existingAgent = await prisma.deliveryAgent.findUnique({
                where: {
                    userId: updatedUser.id,
                },
            });
            if (!existingAgent) {
                await prisma.deliveryAgent.create({
                    data: {
                        userId: updatedUser.id,
                        phone: updatedUser.phone,
                        employeeCode: `AG-${Date.now()}`,
                        status: "ACTIVE",
                        availability: true,
                    },
                });
            }
        }
        const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
        return userWithoutPassword;
    }
    static async deleteUser(id) {
        return await prisma.user.update({ where: { id }, data: { status: 'INACTIVE', deletedAt: new Date() } });
    }
}
exports.UserService = UserService;
