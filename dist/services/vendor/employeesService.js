"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployees = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getEmployees = async (userId, search = '') => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const employees = await prisma_1.default.vendorEmployee.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
    });
    // Join with User to get names / contact info.
    // VendorEmployee.employeeId maps to User.id (no Prisma relation defined).
    const userIds = employees.map((e) => e.employeeId);
    const users = await prisma_1.default.user.findMany({
        where: Object.assign({ id: { in: userIds } }, (search
            ? {
                OR: [
                    {
                        fullName: {
                            contains: search,
                            mode: client_1.Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: client_1.Prisma.QueryMode.insensitive,
                        },
                    },
                ],
            }
            : {})),
        select: { id: true, fullName: true, email: true, phone: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    // When a search is active, only return employees whose User matched
    const filtered = search
        ? employees.filter((e) => userMap.has(e.employeeId))
        : employees;
    return filtered.map((e) => {
        var _a, _b, _c, _d, _e;
        const u = userMap.get(e.employeeId);
        return {
            id: e.id,
            employeeId: e.employeeId,
            fullName: (_a = u === null || u === void 0 ? void 0 : u.fullName) !== null && _a !== void 0 ? _a : '',
            email: (_b = u === null || u === void 0 ? void 0 : u.email) !== null && _b !== void 0 ? _b : '',
            phone: (_c = u === null || u === void 0 ? void 0 : u.phone) !== null && _c !== void 0 ? _c : '',
            designation: (_d = e.designation) !== null && _d !== void 0 ? _d : '',
            department: (_e = e.department) !== null && _e !== void 0 ? _e : '',
            joiningDate: e.joiningDate,
            status: e.status,
        };
    });
};
exports.getEmployees = getEmployees;
const createEmployee = async (userId, data) => {
    var _a, _b, _c;
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    // Verify the referenced user exists
    const user = await prisma_1.default.user.findUnique({ where: { id: data.employeeId } });
    if (!user)
        throw new Error('User not found with the provided employeeId');
    return prisma_1.default.vendorEmployee.create({
        data: {
            vendorId: vendor.id,
            employeeId: data.employeeId,
            designation: (_a = data.designation) !== null && _a !== void 0 ? _a : null,
            department: (_b = data.department) !== null && _b !== void 0 ? _b : null,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
            status: (_c = data.status) !== null && _c !== void 0 ? _c : 'ACTIVE',
        },
    });
};
exports.createEmployee = createEmployee;
const updateEmployee = async (userId, recordId, data) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const emp = await prisma_1.default.vendorEmployee.findFirst({
        where: { id: recordId, vendorId: vendor.id },
    });
    if (!emp)
        throw new Error('Employee not found');
    return prisma_1.default.vendorEmployee.update({ where: { id: recordId }, data });
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (userId, recordId) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const emp = await prisma_1.default.vendorEmployee.findFirst({
        where: { id: recordId, vendorId: vendor.id },
    });
    if (!emp)
        throw new Error('Employee not found');
    return prisma_1.default.vendorEmployee.delete({ where: { id: recordId } });
};
exports.deleteEmployee = deleteEmployee;
