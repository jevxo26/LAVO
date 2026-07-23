"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickupQRCodes = exports.acceptPickup = exports.getAvailablePickups = void 0;
const client_1 = require("@prisma/client");
const smsService_1 = require("../smsService");
const prisma = new client_1.PrismaClient();
const geoUtils_1 = require("../../utils/geoUtils");
const getAvailablePickups = async (userId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId
        }
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const deliveries = await prisma.delivery.findMany({
        where: {
            deliveryType: "PICKUP",
            // Only show pickups whose order is still waiting for pickup
            order: {
                orderStatus: { in: ["PENDING", "CONFIRMED"] }
            },
            OR: [
                // Unassigned pickups for this branch — any agent can claim these
                {
                    branchId: agent.branchId,
                    assignedAgentId: null,
                    deliveryStatus: "PENDING",
                },
                // Already assigned to this agent and still active
                {
                    assignedAgentId: agent.id,
                    deliveryStatus: {
                        in: ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"]
                    }
                }
            ]
        },
        include: {
            order: true,
            customer: {
                include: {
                    user: true,
                    addresses: true
                }
            },
            branch: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    // console.log("Agent ID:", agent.id);
    // console.log(
    //     "Assigned Deliveries:",
    //     deliveries.map(d => ({
    //         id: d.id,
    //         type: d.deliveryType,
    //         status: d.deliveryStatus
    //     }))
    // );
    return deliveries.map((delivery) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const customerAddress = ((_a = delivery.customer) === null || _a === void 0 ? void 0 : _a.addresses.find(addr => addr.isDefault)) || ((_b = delivery.customer) === null || _b === void 0 ? void 0 : _b.addresses[0]);
        let distance = null;
        if (((_c = delivery.branch) === null || _c === void 0 ? void 0 : _c.latitude) &&
            ((_d = delivery.branch) === null || _d === void 0 ? void 0 : _d.longitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.latitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.longitude)) {
            distance = (0, geoUtils_1.calculateDistance)(delivery.branch.latitude, delivery.branch.longitude, customerAddress.latitude, customerAddress.longitude);
        }
        return {
            id: delivery.id,
            orderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName: ((_f = (_e = delivery.customer) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.fullName) || (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.receiverName) || "N/A",
            customerPhone: ((_h = (_g = delivery.customer) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.phone) || (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.receiverPhone) || "N/A",
            branch: (_k = (_j = delivery.branch) === null || _j === void 0 ? void 0 : _j.branchName) !== null && _k !== void 0 ? _k : "N/A",
            pickupAddress: (_l = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.fullAddress) !== null && _l !== void 0 ? _l : "N/A",
            distance: distance ? `${distance} KM` : "N/A",
            priority: "NORMAL",
            totalGarments: (_o = (_m = delivery.order) === null || _m === void 0 ? void 0 : _m.totalGarments) !== null && _o !== void 0 ? _o : 0,
            status: delivery.deliveryStatus,
            createdAt: delivery.createdAt
        };
    });
};
exports.getAvailablePickups = getAvailablePickups;
const acceptPickup = async (userId, deliveryId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId
        }
    });
    if (!agent) {
        throw new Error("Agent not found");
    }
    const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId }
    });
    if (!delivery) {
        throw new Error("Delivery not found");
    }
    if (delivery.assignedAgentId !== null && delivery.assignedAgentId !== agent.id) {
        throw new Error("This delivery has already been accepted by another agent.");
    }
    // Fetch customer profile & address info for SMS
    const customerInfo = await prisma.customer.findUnique({
        where: { id: delivery.customerId },
        include: {
            user: { select: { fullName: true, phone: true } },
            addresses: { select: { receiverName: true, receiverPhone: true } }
        }
    });
    const orderInfo = await prisma.order.findUnique({
        where: { id: delivery.orderId },
        select: { orderNumber: true, pickupAddressId: true }
    });
    const specificAddress = (orderInfo === null || orderInfo === void 0 ? void 0 : orderInfo.pickupAddressId)
        ? await prisma.customerAddress.findUnique({ where: { id: orderInfo.pickupAddressId } })
        : null;
    const updatedDelivery = await prisma.$transaction(async (tx) => {
        var _a, _b, _c, _d, _e, _f;
        // 1. Mark delivery as ACCEPTED
        const updated = await tx.delivery.update({
            where: { id: deliveryId },
            data: {
                assignedAgentId: agent.id,
                deliveryStatus: "IN_PROGRESS"
            }
        });
        // 2. Advance the order status to CONFIRMED so the customer tracking page moves forward
        await tx.order.update({
            where: { id: delivery.orderId },
            data: { orderStatus: "CONFIRMED" }
        });
        // 3. Add a timeline entry for the customer
        await tx.orderTimeline.create({
            data: {
                orderId: delivery.orderId,
                status: "CONFIRMED",
                description: "A pickup agent is on the way to collect your garments.",
            }
        });
        // 4. Generate a pickup verification OTP (agent presents to customer at pickup)
        const existingOtp = await tx.deliveryOTP.findFirst({
            where: {
                deliveryId: delivery.id,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });
        let otpToSend = existingOtp === null || existingOtp === void 0 ? void 0 : existingOtp.otpCode;
        if (!existingOtp) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            await tx.deliveryOTP.create({
                data: {
                    deliveryId: delivery.id,
                    otpCode: otp.toString(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                }
            });
            otpToSend = otp.toString();
        }
        // Trigger Pickup OTP SMS to Customer (Priority: specificAddress.receiverPhone -> user.phone -> addresses[0].receiverPhone)
        const customerPhone = (specificAddress === null || specificAddress === void 0 ? void 0 : specificAddress.receiverPhone) || ((_a = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.user) === null || _a === void 0 ? void 0 : _a.phone) || ((_c = (_b = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.addresses) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.receiverPhone);
        const customerName = (specificAddress === null || specificAddress === void 0 ? void 0 : specificAddress.receiverName) || ((_d = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.user) === null || _d === void 0 ? void 0 : _d.fullName) || ((_f = (_e = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.addresses) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.receiverName);
        const orderNum = (orderInfo === null || orderInfo === void 0 ? void 0 : orderInfo.orderNumber) || delivery.orderId;
        if (customerPhone && otpToSend) {
            console.log(`📱 [Pickup OTP SMS] Sending OTP ${otpToSend} to customer phone: ${customerPhone} for Order ${orderNum}`);
            smsService_1.SMSService.sendPickupOTP(customerPhone, otpToSend, orderNum, customerName).catch((err) => {
                console.error("[Pickup SMS Error]:", err);
            });
        }
        else {
            console.warn(`⚠️ [Pickup OTP SMS] Could not send SMS for Order ${orderNum}: Customer phone number not found in profile or address.`);
        }
        return updated;
    });
    console.log("ACCEPTED PICKUP DELIVERY:", updatedDelivery);
    return updatedDelivery;
};
exports.acceptPickup = acceptPickup;
const getPickupQRCodes = async (userId, deliveryId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: { userId },
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const delivery = await prisma.delivery.findUnique({
        where: {
            id: deliveryId,
            assignedAgentId: agent.id,
        },
        include: {
            order: {
                include: {
                    items: {
                        include: {
                            garmentItems: {
                                include: {
                                    qrCodeRecord: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!delivery) {
        throw new Error("Delivery not found or not assigned to you");
    }
    const garmentItems = delivery.order.items.flatMap((oi) => oi.garmentItems);
    return garmentItems.map((gi) => {
        var _a;
        return ({
            garmentId: gi.id,
            garmentName: gi.garmentName,
            qrCode: ((_a = gi.qrCodeRecord) === null || _a === void 0 ? void 0 : _a.qrCode) || null,
            status: gi.status,
        });
    });
};
exports.getPickupQRCodes = getPickupQRCodes;
