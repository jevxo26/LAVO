"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptDelivery = exports.getAvailableDeliveries = void 0;
const client_1 = require("@prisma/client");
const smsService_1 = require("../shared/smsService");
const socketInstance_1 = require("../../config/socketInstance");
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
            order: {
                include: {
                    vendor: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return deliveries.map((delivery) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        const targetAddressId = delivery.deliveryAddressId || ((_a = delivery.order) === null || _a === void 0 ? void 0 : _a.deliveryAddressId);
        const customerAddress = ((_b = delivery.customer) === null || _b === void 0 ? void 0 : _b.addresses.find((addr) => addr.id === targetAddressId)) ||
            ((_c = delivery.customer) === null || _c === void 0 ? void 0 : _c.addresses.find((addr) => addr.isDefault)) || ((_d = delivery.customer) === null || _d === void 0 ? void 0 : _d.addresses[0]);
        const assignedVendor = (_e = delivery.order) === null || _e === void 0 ? void 0 : _e.vendor;
        const pickupSource = assignedVendor
            ? {
                isVendor: true,
                type: "VENDOR",
                name: assignedVendor.businessName,
                code: assignedVendor.vendorCode,
                phone: assignedVendor.phone || "N/A",
            }
            : {
                isVendor: false,
                type: "BRANCH",
                name: ((_f = delivery.branch) === null || _f === void 0 ? void 0 : _f.branchName) || "Main Branch Hub",
                code: ((_g = delivery.branch) === null || _g === void 0 ? void 0 : _g.branchCode) || "BRANCH",
                phone: ((_h = delivery.branch) === null || _h === void 0 ? void 0 : _h.phone) || "N/A",
            };
        let distanceVal = null;
        const bLat = (_k = (_j = delivery.branch) === null || _j === void 0 ? void 0 : _j.latitude) !== null && _k !== void 0 ? _k : 23.8103;
        const bLng = (_m = (_l = delivery.branch) === null || _l === void 0 ? void 0 : _l.longitude) !== null && _m !== void 0 ? _m : 90.4125;
        const cLat = (_o = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.latitude) !== null && _o !== void 0 ? _o : (23.7900 + (parseInt(delivery.id.slice(-3), 16) % 50) * 0.001);
        const cLng = (_p = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.longitude) !== null && _p !== void 0 ? _p : (90.4000 + (parseInt(delivery.id.slice(-3), 16) % 50) * 0.001);
        if (bLat && bLng && cLat && cLng) {
            distanceVal = calculateDistance(bLat, bLng, cLat, cLng);
        }
        return {
            id: delivery.id,
            orderId: ((_q = delivery.order) === null || _q === void 0 ? void 0 : _q.orderNumber) || delivery.orderId,
            rawOrderId: delivery.orderId,
            customerName: (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.receiverName) || ((_s = (_r = delivery.customer) === null || _r === void 0 ? void 0 : _r.user) === null || _s === void 0 ? void 0 : _s.fullName) || "N/A",
            customerPhone: (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.receiverPhone) || ((_u = (_t = delivery.customer) === null || _t === void 0 ? void 0 : _t.user) === null || _u === void 0 ? void 0 : _u.phone) || "N/A",
            branch: (_w = (_v = delivery.branch) === null || _v === void 0 ? void 0 : _v.branchName) !== null && _w !== void 0 ? _w : "N/A",
            pickupSource,
            deliveryAddress: (_x = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.fullAddress) !== null && _x !== void 0 ? _x : "N/A",
            // Order model ->
            parcelType: (_z = (_y = delivery.order) === null || _y === void 0 ? void 0 : _y.orderType) !== null && _z !== void 0 ? _z : "N/A",
            paymentType: (_1 = (_0 = delivery.order) === null || _0 === void 0 ? void 0 : _0.paymentStatus) !== null && _1 !== void 0 ? _1 : "N/A",
            //  schema-N/A
            weight: "N/A",
            // COD amount = grandTotal
            codAmount: (_3 = (_2 = delivery.order) === null || _2 === void 0 ? void 0 : _2.grandTotal) !== null && _3 !== void 0 ? _3 : 0,
            distance: distanceVal
                ? `${distanceVal} KM`
                : null,
            priority: "NORMAL",
            totalGarments: (_5 = (_4 = delivery.order) === null || _4 === void 0 ? void 0 : _4.totalGarments) !== null && _5 !== void 0 ? _5 : 0,
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
        include: {
            user: { select: { phone: true, fullName: true } }
        }
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
        var _a, _b, _c, _d, _e, _f, _g;
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
        try {
            if (customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.userId) {
                (0, socketInstance_1.getIO)().to(`customer_${customerInfo.userId}`).emit("orderStatusUpdated", {
                    orderId: delivery.orderId,
                    orderStatus: "DELIVERY",
                });
                console.log(`📢 [Socket] Broadcasted orderStatusUpdated (DELIVERY) to customer_${customerInfo.userId}`);
            }
        }
        catch (err) {
            console.error("Socket broadcast failed in acceptDelivery:", err);
        }
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
        const agentPhone = ((_g = agent.user) === null || _g === void 0 ? void 0 : _g.phone) || agent.phone;
        const orderNum = (orderInfo === null || orderInfo === void 0 ? void 0 : orderInfo.orderNumber) || delivery.orderId;
        if (customerPhone && otpToSend) {
            console.log(`📱 [Delivery OTP SMS] Sending OTP ${otpToSend} with agent phone ${agentPhone} to customer phone: ${customerPhone} for Order ${orderNum}`);
            smsService_1.SMSService.sendDeliveryOTP(customerPhone, otpToSend, orderNum, customerName, agentPhone).catch((err) => {
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
