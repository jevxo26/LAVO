"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGarmentStatus = exports.generateAllQrCodes = exports.generateQrCode = exports.getOrderQrCodes = exports.getPickupOrders = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get all orders that have been picked up and need QR tagging / processing.
 * Status: PICKUP, PROCESSING, WASHING, DRYING, IRONING, FOLDING
 */
exports.getPickupOrders = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    // Find the branch this employee belongs to via BranchEmployee table
    const branchEmployee = await prisma.branchEmployee.findFirst({
        where: { employeeId: userId },
        select: { branchId: true }
    });
    // Find if user is linked to a Vendor
    const vendorRecord = await prisma.vendor.findFirst({
        where: { OR: [{ email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email }, { phone: (_c = req.user) === null || _c === void 0 ? void 0 : _c.phone }] },
        select: { id: true }
    });
    const branchId = branchEmployee === null || branchEmployee === void 0 ? void 0 : branchEmployee.branchId;
    const vendorId = vendorRecord === null || vendorRecord === void 0 ? void 0 : vendorRecord.id;
    const orders = await prisma.order.findMany({
        where: Object.assign(Object.assign({}, (vendorId ? { vendorId } : branchId ? { branchId } : {})), { orderStatus: { in: ['PICKUP', 'PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING'] } }),
        include: {
            customer: {
                include: {
                    user: { select: { fullName: true, phone: true } },
                    addresses: { select: { receiverName: true, receiverPhone: true } }
                }
            },
            items: {
                include: {
                    garmentType: true,
                    garmentItems: {
                        include: { qrCodeRecord: true }
                    }
                }
            },
            branch: true
        },
        orderBy: { createdAt: 'asc' }
    });
    const formatted = orders.map((order) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const totalGarments = order.items.reduce((sum, item) => sum + item.garmentItems.length, 0);
        const qrGenerated = order.items.reduce((sum, item) => sum + item.garmentItems.filter((g) => g.qrCodeRecord).length, 0);
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            customerName: ((_b = (_a = order.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) || ((_e = (_d = (_c = order.customer) === null || _c === void 0 ? void 0 : _c.addresses) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.receiverName) || 'N/A',
            customerPhone: ((_g = (_f = order.customer) === null || _f === void 0 ? void 0 : _f.user) === null || _g === void 0 ? void 0 : _g.phone) || ((_k = (_j = (_h = order.customer) === null || _h === void 0 ? void 0 : _h.addresses) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.receiverPhone) || 'N/A',
            branch: ((_l = order.branch) === null || _l === void 0 ? void 0 : _l.branchName) || 'N/A',
            totalGarments,
            qrGenerated,
            allQrDone: totalGarments > 0 && qrGenerated === totalGarments,
            createdAt: order.createdAt,
        };
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Orders fetched', data: formatted });
});
/**
 * Get garment items with QR codes for a specific order
 */
exports.getOrderQrCodes = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    var _a;
    const { orderId } = req.params;
    let items = await prisma.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: {
            qrCodeRecord: true,
            orderItem: { include: { garmentType: true } }
        }
    });
    // Auto-create garment item records if they don't exist yet
    if (items.length === 0) {
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
            include: { garmentType: true }
        });
        const createPromises = [];
        for (const oi of orderItems) {
            for (let i = 0; i < oi.quantity; i++) {
                createPromises.push(prisma.garmentItem.create({
                    data: {
                        orderItemId: oi.id,
                        garmentCode: `G-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                        garmentName: ((_a = oi.garmentType) === null || _a === void 0 ? void 0 : _a.name) || 'Garment Item',
                    }
                }));
            }
        }
        if (createPromises.length > 0) {
            await Promise.all(createPromises);
            items = await prisma.garmentItem.findMany({
                where: { orderItem: { orderId } },
                include: {
                    qrCodeRecord: true,
                    orderItem: { include: { garmentType: true } }
                }
            });
        }
    }
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Garment items fetched', data: items });
});
/**
 * Generate QR code for a single garment item
 */
exports.generateQrCode = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const { garmentItemId } = req.params;
    const existing = await prisma.garmentQRCode.findUnique({ where: { garmentItemId } });
    if (existing) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: existing });
        return;
    }
    const qrCode = `LAVO-${garmentItemId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const record = await prisma.garmentQRCode.create({
        data: { garmentItemId, qrCode, status: 'ACTIVE' }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'QR code generated', data: record });
});
/**
 * Generate QR codes for ALL garments in an order at once
 */
exports.generateAllQrCodes = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    var _a;
    const { orderId } = req.params;
    // Ensure garment items exist first
    let items = await prisma.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: { qrCodeRecord: true }
    });
    if (items.length === 0) {
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
            include: { garmentType: true }
        });
        const createPromises = [];
        for (const oi of orderItems) {
            for (let i = 0; i < oi.quantity; i++) {
                createPromises.push(prisma.garmentItem.create({
                    data: {
                        orderItemId: oi.id,
                        garmentCode: `G-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                        garmentName: ((_a = oi.garmentType) === null || _a === void 0 ? void 0 : _a.name) || 'Garment Item',
                    }
                }));
            }
        }
        if (createPromises.length > 0) {
            await Promise.all(createPromises);
            items = await prisma.garmentItem.findMany({
                where: { orderItem: { orderId } },
                include: { qrCodeRecord: true }
            });
        }
    }
    const created = [];
    for (const item of items) {
        if (!item.qrCodeRecord) {
            const qrCode = `LAVO-${item.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
            const record = await prisma.garmentQRCode.create({
                data: { garmentItemId: item.id, qrCode, status: 'ACTIVE' }
            });
            created.push(record);
        }
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `${created.length} QR code(s) generated`,
        data: created
    });
});
/**
 * GET /employee/garment-status?qrCode=<code>
 * Returns the current status of a garment identified by its QR code.
 * Used by the scanner UI to disable the already-applied stage button.
 */
exports.getGarmentStatus = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const { qrCode } = req.query;
    if (!qrCode) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 400, success: false, message: 'qrCode query param is required' });
    }
    const qrRecord = await prisma.garmentQRCode.findUnique({
        where: { qrCode },
        include: {
            garmentItem: {
                select: { status: true, garmentName: true }
            }
        }
    });
    if (!qrRecord || !qrRecord.garmentItem) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 404, success: false, message: 'QR code not found' });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Garment status retrieved',
        data: {
            status: qrRecord.garmentItem.status,
            garmentName: qrRecord.garmentItem.garmentName,
        }
    });
});
