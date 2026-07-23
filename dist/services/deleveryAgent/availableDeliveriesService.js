"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptDelivery = exports.getAvailableDeliveries = void 0;
const client_1 = require("@prisma/client");
const smsService_1 = require("../smsService");
const prisma = new client_1.PrismaClient();
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
};
const getAvailableDeliveries = async (userId) => {
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
            deliveryType: "DROP_OFF",
            // Only show drop-offs whose order is actually ready
            order: {
                orderStatus: { in: ["READY_FOR_DELIVERY", "DELIVERY"] }
            },
            OR: [
                // Unassigned drop-offs for this branch — any agent can claim these
                {
                    branchId: agent.branchId,
                    assignedAgentId: null,
                    deliveryStatus: "PENDING",
                },
                // Already assigned to this agent and still active
                {
                    assignedAgentId: agent.id,
                    deliveryStatus: {
                        in: ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"],
                    },
                }
            ]
        },
        include: {
            customer: {
                include: {
                    user: true,
                    addresses: true,
                },
            },
            branch: true,
            order: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    // console.log("Total deliveries:", deliveries.length);
    // console.log(deliveries);
    return deliveries.map((delivery) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const customerAddress = delivery.customer.addresses.find((addr) => addr.isDefault) || delivery.customer.addresses[0];
        let distance = null;
        if (((_a = delivery.branch) === null || _a === void 0 ? void 0 : _a.latitude) &&
            ((_b = delivery.branch) === null || _b === void 0 ? void 0 : _b.longitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.latitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.longitude)) {
            distance = calculateDistance(delivery.branch.latitude, delivery.branch.longitude, customerAddress.latitude, customerAddress.longitude);
        }
        return {
            id: delivery.id,
            orderId: delivery.orderId,
            customerName: ((_d = (_c = delivery.customer) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.fullName) || (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.receiverName) || "N/A",
            customerPhone: ((_f = (_e = delivery.customer) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.phone) || (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.receiverPhone) || "N/A",
            branch: (_h = (_g = delivery.branch) === null || _g === void 0 ? void 0 : _g.branchName) !== null && _h !== void 0 ? _h : "N/A",
            deliveryAddress: (_j = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.fullAddress) !== null && _j !== void 0 ? _j : "N/A",
            // Order model ->
            parcelType: (_l = (_k = delivery.order) === null || _k === void 0 ? void 0 : _k.orderType) !== null && _l !== void 0 ? _l : "N/A",
            paymentType: (_o = (_m = delivery.order) === null || _m === void 0 ? void 0 : _m.paymentStatus) !== null && _o !== void 0 ? _o : "N/A",
            //  schema-N/A
            weight: "N/A",
            // COD amount = grandTotal
            codAmount: (_q = (_p = delivery.order) === null || _p === void 0 ? void 0 : _p.grandTotal) !== null && _q !== void 0 ? _q : 0,
            distance: distance
                ? `${distance} KM`
                : "N/A",
            priority: "NORMAL",
            totalGarments: (_s = (_r = delivery.order) === null || _r === void 0 ? void 0 : _r.totalGarments) !== null && _s !== void 0 ? _s : 0,
            status: delivery.deliveryStatus,
            createdAt: delivery.createdAt,
        };
    });
};
exports.getAvailableDeliveries = getAvailableDeliveries;
const acceptDelivery = async (userId, deliveryId) => {
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
    // Allow self-assignment: if unassigned, this agent claims it.
    // If already assigned to someone else, block it.
    if (delivery.assignedAgentId && delivery.assignedAgentId !== agent.id) {
        throw new Error("This delivery has already been claimed by another agent");
    }
    if (delivery.deliveryStatus === "IN_PROGRESS") {
        throw new Error("Delivery already started");
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
        select: { orderNumber: true, deliveryAddressId: true }
    });
    const specificAddress = (orderInfo === null || orderInfo === void 0 ? void 0 : orderInfo.deliveryAddressId)
        ? await prisma.customerAddress.findUnique({ where: { id: orderInfo.deliveryAddressId } })
        : null;
    const updatedDelivery = await prisma.$transaction(async (tx) => {
        var _a, _b, _c, _d, _e, _f;
        const updated = await tx.delivery.update({
            where: {
                id: deliveryId,
            },
            data: {
                assignedAgentId: agent.id, // self-assign if not already assigned
                deliveryStatus: "IN_PROGRESS",
            },
        });
        // Advance the order to OUT FOR DELIVERY
        await tx.order.update({
            where: { id: delivery.orderId },
            data: { orderStatus: "DELIVERY" }
        });
        await tx.orderTimeline.create({
            data: {
                orderId: delivery.orderId,
                status: "DELIVERY",
                description: "Your clean laundry is out for delivery and on the way to you!",
            }
        });
        const existingOtp = await tx.deliveryOTP.findFirst({
            where: {
                deliveryId: delivery.id,
                isUsed: false,
                expiresAt: {
                    gt: new Date()
                }
            },
        });
        let otpToSend = existingOtp === null || existingOtp === void 0 ? void 0 : existingOtp.otpCode;
        if (!existingOtp) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            await tx.deliveryOTP.create({
                data: {
                    deliveryId: delivery.id,
                    otpCode: otp.toString(),
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                },
            });
            otpToSend = otp.toString();
            console.log("Delivery OTP:", otp);
        }
        // Trigger Delivery OTP SMS to Customer (Priority: specificAddress.receiverPhone -> user.phone -> addresses[0].receiverPhone)
        const customerPhone = (specificAddress === null || specificAddress === void 0 ? void 0 : specificAddress.receiverPhone) || ((_a = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.user) === null || _a === void 0 ? void 0 : _a.phone) || ((_c = (_b = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.addresses) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.receiverPhone);
        const customerName = (specificAddress === null || specificAddress === void 0 ? void 0 : specificAddress.receiverName) || ((_d = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.user) === null || _d === void 0 ? void 0 : _d.fullName) || ((_f = (_e = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.addresses) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.receiverName);
        const orderNum = (orderInfo === null || orderInfo === void 0 ? void 0 : orderInfo.orderNumber) || delivery.orderId;
        if (customerPhone && otpToSend) {
            console.log(`📱 [Delivery OTP SMS] Sending OTP ${otpToSend} to customer phone: ${customerPhone} for Order ${orderNum}`);
            smsService_1.SMSService.sendDeliveryOTP(customerPhone, otpToSend, orderNum, customerName).catch((err) => {
                console.error("[Delivery SMS Error]:", err);
            });
        }
        else {
            console.warn(`⚠️ [Delivery OTP SMS] Could not send SMS for Order ${orderNum}: Customer phone number not found in profile or address.`);
        }
        return updated;
    });
    return updatedDelivery;
};
exports.acceptDelivery = acceptDelivery;
