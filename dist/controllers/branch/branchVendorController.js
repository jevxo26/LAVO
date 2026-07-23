"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchVendorController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = require("../../services/branchDashboardService");
const prisma = new client_1.PrismaClient();
class BranchVendorController {
}
exports.BranchVendorController = BranchVendorController;
_a = BranchVendorController;
/**
 * Get all 3 vendors linked to the manager's branch with real-time capacity and active order counts.
 */
BranchVendorController.getBranchVendors = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const search = req.query.search || '';
    // 1. Fetch vendors linked to this branch
    const vendors = (await prisma.vendor.findMany({
        where: Object.assign({ status: 'ACTIVE' }, (search
            ? {
                OR: [
                    { businessName: { contains: search, mode: 'insensitive' } },
                    { vendorCode: { contains: search, mode: 'insensitive' } },
                    { ownerName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {})),
        include: {
            capacity: true,
            profile: true,
            orders: {
                where: {
                    orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] },
                },
                select: { id: true, orderNumber: true, totalGarments: true, grandTotal: true, createdAt: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    }));
    // 2. Format vendors data
    const formattedVendors = vendors.map((v) => {
        var _b, _c, _d;
        const dailyCapacity = ((_b = v.capacity) === null || _b === void 0 ? void 0 : _b.dailyCapacity) || 20;
        const currentOrders = v.orders.length;
        const availableCapacity = Math.max(0, dailyCapacity - currentOrders);
        const isFull = availableCapacity <= 0;
        return {
            id: v.id,
            vendorCode: v.vendorCode,
            businessName: v.businessName,
            ownerName: v.ownerName,
            email: v.email,
            phone: v.phone,
            status: v.status,
            logo: ((_c = v.profile) === null || _c === void 0 ? void 0 : _c.logo) || null,
            dailyCapacity,
            currentOrders,
            availableCapacity,
            maximumCapacity: ((_d = v.capacity) === null || _d === void 0 ? void 0 : _d.maximumCapacity) || dailyCapacity + 10,
            isFull,
            activeOrders: v.orders,
        };
    });
    // 3. Count total active/pending orders in the branch to check overflow (> 5 orders)
    const branchTotalOrders = await prisma.order.count({
        where: {
            branchId,
            orderStatus: { in: ['PENDING', 'CONFIRMED', 'PICKUP', 'PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] },
        },
    });
    const unassignedBranchOrders = await prisma.order.findMany({
        where: {
            branchId,
            vendorId: null,
            orderStatus: { in: ['PENDING', 'CONFIRMED', 'PICKUP', 'PROCESSING'] },
        },
        select: {
            id: true,
            orderNumber: true,
            totalGarments: true,
            grandTotal: true,
            orderStatus: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    });
    const OVERFLOW_THRESHOLD = 5;
    const isOverflow = branchTotalOrders > OVERFLOW_THRESHOLD;
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Branch vendors fetched successfully',
        data: {
            vendors: formattedVendors,
            branchStats: {
                branchTotalOrders,
                unassignedOrdersCount: unassignedBranchOrders.length,
                overflowThreshold: OVERFLOW_THRESHOLD,
                isOverflow,
            },
            unassignedOrders: unassignedBranchOrders,
        },
    });
});
/**
 * Assign an overflow branch order to a specific vendor with capacity validation.
 */
BranchVendorController.assignOrderToVendor = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { orderId, vendorId } = req.body;
    if (!orderId || !vendorId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, success: false, message: 'orderId and vendorId are required' });
        return;
    }
    // 1. Verify Order belongs to branch
    const order = await prisma.order.findFirst({
        where: { id: orderId, branchId },
    });
    if (!order) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, success: false, message: 'Order not found in your branch' });
        return;
    }
    // 2. Verify Vendor belongs to branch and has available capacity
    const vendor = (await prisma.vendor.findFirst({
        where: { id: vendorId, status: 'ACTIVE' },
        include: { capacity: true },
    }));
    if (!vendor) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, success: false, message: 'Vendor not found or inactive in your branch' });
        return;
    }
    const dailyCap = ((_b = vendor.capacity) === null || _b === void 0 ? void 0 : _b.dailyCapacity) || 20;
    const currentActiveCount = await prisma.order.count({
        where: {
            vendorId,
            orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] },
        },
    });
    if (currentActiveCount >= dailyCap) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 400,
            success: false,
            message: `Vendor ${vendor.businessName} has reached maximum daily capacity (${dailyCap} orders). Please select another vendor.`,
        });
        return;
    }
    // 3. Assign order in a transaction
    const result = await prisma.$transaction(async (tx) => {
        var _b, _c;
        // Update order
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
                vendorId,
                orderStatus: order.orderStatus === 'PENDING' ? 'PROCESSING' : order.orderStatus,
            },
        });
        // Update VendorCapacity
        const newCurrentOrders = currentActiveCount + 1;
        const newAvailable = Math.max(0, dailyCap - newCurrentOrders);
        await tx.vendorCapacity.upsert({
            where: { vendorId },
            update: {
                currentOrders: newCurrentOrders,
                availableCapacity: newAvailable,
            },
            create: {
                vendorId,
                dailyCapacity: dailyCap,
                currentOrders: newCurrentOrders,
                availableCapacity: newAvailable,
                maximumCapacity: dailyCap + 10,
            },
        });
        // Create VendorAssignment tracking record
        await tx.vendorAssignment.create({
            data: {
                vendorId,
                orderId,
                assignedBy: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || 'BRANCH_MANAGER',
                branchId,
                status: 'ACCEPTED',
            },
        });
        // Create OrderTimeline entry (customer-facing neutral description)
        await tx.orderTimeline.create({
            data: {
                orderId,
                status: updatedOrder.orderStatus,
                description: "Your garments are currently undergoing sorting and professional garment processing.",
            },
        });
        return updatedOrder;
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `Order #${order.orderNumber} successfully assigned to ${vendor.businessName}!`,
        data: result,
    });
});
