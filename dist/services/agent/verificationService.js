"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDeliveryOTP = exports.getVerificationList = void 0;
const client_1 = require("@prisma/client");
const socketInstance_1 = require("../../config/socketInstance");
const prisma = new client_1.PrismaClient();
const getVerificationList = async (userId) => {
    // console.log("USER ID:", userId);
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId,
        },
    });
    // console.log("AGENT:", agent);
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const deliveries = await prisma.delivery.findMany({
        where: {
            assignedAgentId: agent.id,
            deliveryStatus: "IN_PROGRESS",
        },
        include: {
            customer: {
                include: {
                    user: true,
                    addresses: true,
                },
            },
            order: true,
            verifications: true,
        },
    });
    return deliveries.map((delivery) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const targetAddressId = delivery.deliveryAddressId || (delivery.deliveryType === 'PICKUP' ? (_a = delivery.order) === null || _a === void 0 ? void 0 : _a.pickupAddressId : (_b = delivery.order) === null || _b === void 0 ? void 0 : _b.deliveryAddressId);
        const address = (_f = (_d = (_c = delivery.customer) === null || _c === void 0 ? void 0 : _c.addresses.find((a) => a.id === targetAddressId)) !== null && _d !== void 0 ? _d : (_e = delivery.customer) === null || _e === void 0 ? void 0 : _e.addresses.find((a) => a.isDefault)) !== null && _f !== void 0 ? _f : (_g = delivery.customer) === null || _g === void 0 ? void 0 : _g.addresses[0];
        return {
            deliveryId: delivery.id,
            orderId: ((_h = delivery.order) === null || _h === void 0 ? void 0 : _h.orderNumber) || delivery.orderId,
            rawOrderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName: (address === null || address === void 0 ? void 0 : address.receiverName) || ((_k = (_j = delivery.customer) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.fullName) || "N/A",
            customerPhone: (address === null || address === void 0 ? void 0 : address.receiverPhone) || ((_m = (_l = delivery.customer) === null || _l === void 0 ? void 0 : _l.user) === null || _m === void 0 ? void 0 : _m.phone) || "N/A",
            deliveryAddress: (_o = address === null || address === void 0 ? void 0 : address.fullAddress) !== null && _o !== void 0 ? _o : "N/A",
            deliveryStatus: delivery.deliveryStatus,
            verificationStatus: delivery.verifications.length > 0 &&
                delivery.verifications[0].verifiedAt
                ? "VERIFIED"
                : "PENDING",
        };
    });
};
exports.getVerificationList = getVerificationList;
const verifyDeliveryOTP = async (userId, deliveryId, otp) => {
    var _a, _b;
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId,
        },
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const delivery = await prisma.delivery.findUnique({
        where: {
            id: deliveryId,
        },
    });
    if (!delivery) {
        throw new Error("Delivery not found");
    }
    if (delivery.assignedAgentId !== agent.id) {
        throw new Error("Unauthorized delivery");
    }
    const deliveryOtp = await prisma.deliveryOTP.findFirst({
        where: {
            deliveryId,
            otpCode: otp,
            isUsed: false,
        },
    });
    if (!deliveryOtp) {
        throw new Error("Invalid OTP");
    }
    console.log("OTP FROM DB:", deliveryOtp);
    console.log("EXPIRES AT:", deliveryOtp.expiresAt);
    console.log("NOW:", new Date());
    if (deliveryOtp.expiresAt < new Date()) {
        throw new Error("OTP expired");
    }
    await prisma.deliveryOTP.update({
        where: {
            id: deliveryOtp.id,
        },
        data: {
            isUsed: true,
        },
    });
    // Determine new status based on delivery type BEFORE updating
    const isPickup = delivery.deliveryType === 'PICKUP';
    const newDeliveryStatus = isPickup ? 'COLLECTED' : 'DELIVERED';
    await prisma.delivery.update({
        where: {
            id: deliveryId,
        },
        data: {
            deliveryStatus: newDeliveryStatus,
            completedAt: new Date(),
        },
    });
    // Advance order status based on delivery type
    if (delivery.deliveryType === 'DROP_OFF') {
        // Drop-off verified = order fully COMPLETED
        await prisma.order.update({
            where: { id: delivery.orderId },
            data: { orderStatus: 'COMPLETED', completedAt: new Date() }
        });
        await prisma.orderTimeline.create({
            data: {
                orderId: delivery.orderId,
                status: 'COMPLETED',
                description: 'Your clean laundry has been successfully delivered. Thank you!',
            }
        });
        try {
            const order = await prisma.order.findUnique({
                where: { id: delivery.orderId },
                include: { customer: true },
            });
            if ((_a = order === null || order === void 0 ? void 0 : order.customer) === null || _a === void 0 ? void 0 : _a.userId) {
                (0, socketInstance_1.getIO)().to(`customer_${order.customer.userId}`).emit('orderStatusUpdated', {
                    orderId: delivery.orderId,
                    orderStatus: 'COMPLETED',
                });
                console.log(`📢 [Socket] Broadcasted orderStatusUpdated (COMPLETED) to customer_${order.customer.userId}`);
            }
        }
        catch (err) {
            console.error('Socket broadcast failed in verifyOTP:', err);
        }
    }
    else if (delivery.deliveryType === 'PICKUP') {
        // Pickup verified = garments collected, now being taken to the branch
        await prisma.order.update({
            where: { id: delivery.orderId },
            data: { orderStatus: 'PICKUP' }
        });
        await prisma.orderTimeline.create({
            data: {
                orderId: delivery.orderId,
                status: 'PICKUP',
                description: 'Your garments have been collected and are on their way to the laundry hub.',
            }
        });
        try {
            const order = await prisma.order.findUnique({
                where: { id: delivery.orderId },
                include: { customer: true },
            });
            if ((_b = order === null || order === void 0 ? void 0 : order.customer) === null || _b === void 0 ? void 0 : _b.userId) {
                (0, socketInstance_1.getIO)().to(`customer_${order.customer.userId}`).emit('orderStatusUpdated', {
                    orderId: delivery.orderId,
                    orderStatus: 'PICKUP',
                });
                console.log(`📢 [Socket] Broadcasted orderStatusUpdated (PICKUP) to customer_${order.customer.userId}`);
            }
        }
        catch (err) {
            console.error('Socket broadcast failed in verifyOTP:', err);
        }
    }
    await prisma.deliveryVerification.create({
        data: {
            deliveryId,
            verificationMethod: "OTP",
            verificationCode: otp,
            verifiedBy: agent.id,
            verifiedAt: new Date(),
        },
    });
    return {
        message: isPickup
            ? "Pickup verified successfully — garments collected!"
            : "Delivery verified successfully — order completed!",
    };
};
exports.verifyDeliveryOTP = verifyDeliveryOTP;
