"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDeliveryOTP = exports.getVerificationList = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getVerificationList = async (userId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId,
        },
    });
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
            verifications: true,
        },
    });
    return deliveries.map((delivery) => {
        var _a, _b;
        const address = (_a = delivery.customer.addresses.find((a) => a.isDefault)) !== null && _a !== void 0 ? _a : delivery.customer.addresses[0];
        return {
            deliveryId: delivery.id,
            orderId: delivery.orderId,
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
    await prisma.delivery.update({
        where: {
            id: deliveryId,
        },
        data: {
            deliveryStatus: "COMPLETED",
            completedAt: new Date(),
        },
    });
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
        message: "Delivery verified successfully",
    };
};
exports.verifyDeliveryOTP = verifyDeliveryOTP;
