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
