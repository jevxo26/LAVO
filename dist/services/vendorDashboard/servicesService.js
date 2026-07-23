"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleServiceStatus = exports.updateService = exports.getServices = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getServices = async (userId) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    // Fetch VendorService rows for this vendor
    const vendorServices = await prisma_1.default.vendorService.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
    });
    // VendorPricing has no Prisma relation on VendorService — query it separately
    // and key by serviceId for a fast join.
    const pricings = await prisma_1.default.vendorPricing.findMany({
        where: { vendorId: vendor.id },
    });
    const pricingMap = new Map(pricings.map((p) => [p.serviceId, p]));
    return vendorServices.map((vs) => {
        var _a, _b, _c, _d;
        const pricing = pricingMap.get(vs.serviceId);
        return {
            id: vs.id,
            serviceId: vs.serviceId,
            processingTime: (_a = vs.processingTime) !== null && _a !== void 0 ? _a : '',
            price: vs.price,
            minimumOrder: vs.minimumOrder,
            maximumOrder: (_b = vs.maximumOrder) !== null && _b !== void 0 ? _b : null,
            status: vs.status,
            processingCost: (_c = pricing === null || pricing === void 0 ? void 0 : pricing.processingCost) !== null && _c !== void 0 ? _c : 0,
            vendorRate: (_d = pricing === null || pricing === void 0 ? void 0 : pricing.vendorRate) !== null && _d !== void 0 ? _d : 0,
            createdAt: vs.createdAt,
        };
    });
};
exports.getServices = getServices;
const updateService = async (userId, serviceId, data) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const vs = await prisma_1.default.vendorService.findFirst({
        where: { id: serviceId, vendorId: vendor.id },
    });
    if (!vs)
        throw new Error('Service not found');
    return prisma_1.default.vendorService.update({ where: { id: serviceId }, data });
};
exports.updateService = updateService;
const toggleServiceStatus = async (userId, serviceId) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const vs = await prisma_1.default.vendorService.findFirst({
        where: { id: serviceId, vendorId: vendor.id },
    });
    if (!vs)
        throw new Error('Service not found');
    return prisma_1.default.vendorService.update({
        where: { id: serviceId },
        data: { status: vs.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
    });
};
exports.toggleServiceStatus = toggleServiceStatus;
