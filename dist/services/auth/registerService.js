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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
class RegisterService {
}
exports.RegisterService = RegisterService;
_a = RegisterService;
RegisterService.registerUser = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    var _b, _c, _d;
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }
    if (!data.email || !data.password) {
        throw new Error('Email and password are required');
    }
    console.log('📝 Registration - password type:', typeof data.password, '| length:', (_b = data.password) === null || _b === void 0 ? void 0 : _b.length, '| value repr:', JSON.stringify(data.password));
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    console.log('📝 Registration - hashed password (first 20 chars):', hashedPassword.substring(0, 20), '| hash length:', hashedPassword.length);
    // Verify immediately: can we compare back?
    const verifyCheck = await bcrypt_1.default.compare(data.password, hashedPassword);
    console.log('📝 Registration - immediate verify check:', verifyCheck);
    // Accept either "name" (from signup form) or "fullName" (direct API calls)
    const fullName = data.fullName || data.name;
    if (!fullName)
        throw new Error('Full name is required');
    const user = await prisma.user.create({
        data: {
            fullName,
            email: data.email,
            phone: (_c = data.phone) !== null && _c !== void 0 ? _c : null,
            password: hashedPassword,
            // Public registration is always CUSTOMER.
            // Admins, Branch Managers, and Delivery Agents
            // are created by an Admin via the /api/users endpoint.
            userType: 'CUSTOMER',
        },
    });
    // After creation, read it back and verify
    const readBack = await prisma.user.findUnique({ where: { id: user.id } });
    console.log('📝 Registration - readback password matches stored?', (readBack === null || readBack === void 0 ? void 0 : readBack.password) === hashedPassword);
    console.log('📝 Registration - readback password (first 20 chars):', (_d = readBack === null || readBack === void 0 ? void 0 : readBack.password) === null || _d === void 0 ? void 0 : _d.substring(0, 20));
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return userWithoutPassword;
});
RegisterService.getMe = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
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
