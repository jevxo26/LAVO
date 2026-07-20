"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDeliveryOTP = exports.getVerificationList = void 0;
const client_1 = require("@prisma/client");
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
        var _a, _b;
        const address = (_a = delivery.customer.addresses.find((a) => a.isDefault)) !== null && _a !== void 0 ? _a : delivery.customer.addresses[0];
        return {
            deliveryId: delivery.id,
            orderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName: delivery.customer.user.fullName,
            customerPhone: delivery.customer.user.phone,
            deliveryAddress: (_b = address === null || address === void 0 ? void 0 : address.fullAddress) !== null && _b !== void 0 ? _b : "N/A",
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
