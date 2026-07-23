import { PrismaClient } from "@prisma/client";
import { SMSService } from "../smsService";

const prisma = new PrismaClient();

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number((R * c).toFixed(2));
};

export const getAvailableDeliveries = async (
  userId: string
) => {
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
    const targetAddressId = delivery.deliveryAddressId || delivery.order?.deliveryAddressId;
    const customerAddress =
      delivery.customer?.addresses.find(
        (addr) => addr.id === targetAddressId
      ) ||
      delivery.customer?.addresses.find(
        (addr) => addr.isDefault
      ) || delivery.customer?.addresses[0];

    let distance = null;

    if (
      delivery.branch?.latitude &&
      delivery.branch?.longitude &&
      customerAddress?.latitude &&
      customerAddress?.longitude
    ) {
      distance = calculateDistance(
        delivery.branch.latitude,
        delivery.branch.longitude,
        customerAddress.latitude,
        customerAddress.longitude
      );
    }
    return {
      id: delivery.id,
      orderId: delivery.order?.orderNumber || delivery.orderId,
      rawOrderId: delivery.orderId,
      customerName:
        customerAddress?.receiverName || delivery.customer?.user?.fullName || "N/A",
      customerPhone:
        customerAddress?.receiverPhone || delivery.customer?.user?.phone || "N/A",
      branch:
        delivery.branch?.branchName ?? "N/A",
      deliveryAddress:
        customerAddress?.fullAddress ?? "N/A",
      // Order model ->
      parcelType:
        delivery.order?.orderType ?? "N/A",
      paymentType:
        delivery.order?.paymentStatus ?? "N/A",
      //  schema-N/A
      weight: "N/A",
      // COD amount = grandTotal
      codAmount:
        delivery.order?.grandTotal ?? 0,
      distance: distance
        ? `${distance} KM`
        : "N/A",
      priority: "NORMAL",
      totalGarments: delivery.order?.totalGarments ?? 0,
      status: delivery.deliveryStatus,
      createdAt: delivery.createdAt,
    };
  });
};



export const acceptDelivery = async (
  userId: string,
  deliveryId: string
) => {
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

  const specificAddress = orderInfo?.deliveryAddressId
    ? await prisma.customerAddress.findUnique({ where: { id: orderInfo.deliveryAddressId } })
    : null;

  const updatedDelivery = await prisma.$transaction(
    async (tx) => {
      const updated = await tx.delivery.update({
          where: {
            id: deliveryId,
          },
          data: {
            assignedAgentId: agent.id,  // self-assign if not already assigned
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

      // Broadcast real-time Socket event to Customer Dashboard & Order Tracker
      try {
        const { getIO } = await import("../../socket");
        if (customerInfo?.userId) {
          getIO().to(`customer_${customerInfo.userId}`).emit("orderStatusUpdated", {
            orderId: delivery.orderId,
            orderStatus: "DELIVERY",
          });
          console.log(`📢 [Socket] Broadcasted orderStatusUpdated (DELIVERY) to customer_${customerInfo.userId}`);
        }
      } catch (err) {
        console.error("Socket broadcast failed in acceptDelivery:", err);
      }

      const existingOtp =
        await tx.deliveryOTP.findFirst({
          where: {
            deliveryId: delivery.id,
            isUsed: false,
            expiresAt: {
              gt: new Date()
            }
          },
        });
      let otpToSend = existingOtp?.otpCode;
      if (!existingOtp) {
        const otp = Math.floor(
          100000 + Math.random() * 900000
        );
        await tx.deliveryOTP.create({
          data: {
            deliveryId: delivery.id,
            otpCode: otp.toString(),
            expiresAt: new Date(
              Date.now() + 48 * 60 * 60 * 1000
            ),
          },
        });
        otpToSend = otp.toString();
        console.log(
          "Delivery OTP:",
          otp
        );
      }

      // Trigger Delivery OTP SMS to Customer (Priority: specificAddress.receiverPhone -> user.phone -> addresses[0].receiverPhone)
      const customerPhone = specificAddress?.receiverPhone || customerInfo?.user?.phone || customerInfo?.addresses?.[0]?.receiverPhone;
      const customerName = specificAddress?.receiverName || customerInfo?.user?.fullName || customerInfo?.addresses?.[0]?.receiverName;
      const agentPhone = agent.user?.phone || agent.phone;
      const orderNum = orderInfo?.orderNumber || delivery.orderId;

      if (customerPhone && otpToSend) {
        console.log(`📱 [Delivery OTP SMS] Sending OTP ${otpToSend} with agent phone ${agentPhone} to customer phone: ${customerPhone} for Order ${orderNum}`);
        SMSService.sendDeliveryOTP(customerPhone, otpToSend, orderNum, customerName, agentPhone).catch((err) => {
          console.error("[Delivery SMS Error]:", err);
        });
      } else {
        console.warn(`⚠️ [Delivery OTP SMS] Could not send SMS for Order ${orderNum}: Customer phone number not found in profile or address.`);
      }

      return updated;
    }
  );
  return updatedDelivery;
};