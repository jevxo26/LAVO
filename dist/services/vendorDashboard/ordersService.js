"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectOrder = exports.acceptOrder = exports.updateOrderStatus = exports.getOrders = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getOrders = async (userId, page, limit, search, status) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const skip = (page - 1) * limit;
    // Build a fully-typed where clause
    const where = { vendorId: vendor.id };
    if (status && status !== 'ALL') {
        where.orderStatus = status;
    }
    if (search) {
        where.OR = [
            { orderNumber: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
            {
                customer: {
                    user: {
                        fullName: { contains: search, mode: client_1.Prisma.QueryMode.insensitive },
                    },
                },
            },
        ];
    }
    const [orders, total] = await Promise.all([
        prisma_1.default.order.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { include: { user: true } },
                branch: true,
                items: true, // OrderItem[] — relation name is `items` in orders.prisma
            },
        }),
        prisma_1.default.order.count({ where }),
    ]);
    return {
        data: orders.map((o) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                id: o.id,
                orderNumber: o.orderNumber,
                customerName: (_c = (_b = (_a = o.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) !== null && _c !== void 0 ? _c : 'Unknown',
                customerPhone: (_f = (_e = (_d = o.customer) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.phone) !== null && _f !== void 0 ? _f : '',
                branchName: (_h = (_g = o.branch) === null || _g === void 0 ? void 0 : _g.branchName) !== null && _h !== void 0 ? _h : '',
                orderStatus: o.orderStatus,
                grandTotal: o.grandTotal,
                itemCount: o.items.length,
                createdAt: o.createdAt,
            });
        }),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getOrders = getOrders;
const updateOrderStatus = async (userId, orderId, newStatus) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const order = await prisma_1.default.order.findFirst({
        where: { id: orderId, vendorId: vendor.id },
    });
    if (!order)
        throw new Error('Order not found or not assigned to this vendor');
    return prisma_1.default.order.update({
        where: { id: orderId },
        data: { orderStatus: newStatus },
    });
};
exports.updateOrderStatus = updateOrderStatus;
const acceptOrder = async (userId, orderId) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const assignment = await prisma_1.default.vendorAssignment.findFirst({
        where: { vendorId: vendor.id, orderId, status: 'PENDING' },
    });
    if (!assignment)
        throw new Error('Assignment not found or already processed');
    return prisma_1.default.vendorAssignment.update({
        where: { id: assignment.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
};
exports.acceptOrder = acceptOrder;
const rejectOrder = async (userId, orderId, reason) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const assignment = await prisma_1.default.vendorAssignment.findFirst({
        where: { vendorId: vendor.id, orderId, status: 'PENDING' },
    });
    if (!assignment)
        throw new Error('Assignment not found or already processed');
    // Log the rejection reason in the order history then update assignment
    await prisma_1.default.orderHistory.create({
        data: {
            orderId,
            action: 'VENDOR_REJECTED',
            performedBy: vendor.id,
            description: reason || 'No reason provided',
        },
    });
    return prisma_1.default.vendorAssignment.update({
        where: { id: assignment.id },
        data: { status: 'REJECTED' },
    });
};
exports.rejectOrder = rejectOrder;
