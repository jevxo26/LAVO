import { PrismaClient } from "@prisma/client";
import { SMSService } from "../shared/smsService";
import { getIO } from "../../config/socketInstance";

const prisma = new PrismaClient();

import { calculateDistance } from "../../utils/geoUtils";

export const getAvailablePickups = async (userId: string) => {
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
            order: {
                include: {
                    vendor: true
                }
            },
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

    return deliveries.map((delivery) => {
        const targetAddressId = delivery.deliveryAddressId || delivery.order?.pickupAddressId;
        const customerAddress =
            delivery.customer?.addresses.find(
                addr => addr.id === targetAddressId
            ) ||
            delivery.customer?.addresses.find(
                addr => addr.isDefault
            ) || delivery.customer?.addresses[0];

        const assignedVendor = (delivery.order as any)?.vendor;
        const dropoffDestination = assignedVendor
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
                name: delivery.branch?.branchName || "Main Branch Hub",
                code: delivery.branch?.branchCode || "BRANCH",
                phone: delivery.branch?.phone || "N/A",
              };

        let distanceVal = null;
        const bLat = delivery.branch?.latitude ?? 23.8103;
        const bLng = delivery.branch?.longitude ?? 90.4125;
        const cLat = customerAddress?.latitude ?? (23.7900 + (parseInt(delivery.id.slice(-3), 16) % 50) * 0.001);
        const cLng = customerAddress?.longitude ?? (90.4000 + (parseInt(delivery.id.slice(-3), 16) % 50) * 0.001);

        if (bLat && bLng && cLat && cLng) {
            distanceVal = calculateDistance(bLat, bLng, cLat, cLng);
        }

        return {
            id: delivery.id,
            orderId: delivery.order?.orderNumber || delivery.orderId,
            rawOrderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName:
                customerAddress?.receiverName || delivery.customer?.user?.fullName || "N/A",
            customerPhone:
                customerAddress?.receiverPhone || delivery.customer?.user?.phone || "N/A",
            branch:
                delivery.branch?.branchName ?? "N/A",
            dropoffDestination,
            pickupAddress:
                customerAddress?.fullAddress ?? "N/A",
            distance:
                distanceVal ? `${distanceVal} KM` : null,
            priority: "NORMAL",
            totalGarments: delivery.order?.totalGarments ?? 0,
            status:
                delivery.deliveryStatus,
            createdAt:
                delivery.createdAt
        };
    });
};
export const acceptPickup = async (
    userId: string,
    deliveryId: string
) => {
    const agent =
        await prisma.deliveryAgent.findUnique({
            where: {
                userId
            },
            include: {
                user: { select: { phone: true, fullName: true } }
            }
        });

    if (!agent) {
        throw new Error(
            "Agent not found"
        );
    }

    const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId }
    });

    if (!delivery) {
        throw new Error(
            "Delivery not found"
        );
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

    const specificAddress = orderInfo?.pickupAddressId
        ? await prisma.customerAddress.findUnique({ where: { id: orderInfo.pickupAddressId } })
        : null;

    const updatedDelivery = await prisma.$transaction(async (tx) => {
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

        // Broadcast real-time Socket event to Customer Dashboard & Order Tracker
        try {
            if (customerInfo?.userId) {
                getIO().to(`customer_${customerInfo.userId}`).emit("orderStatusUpdated", {
                    orderId: delivery.orderId,
                    orderStatus: "CONFIRMED",
                });
                console.log(`📢 [Socket] Broadcasted orderStatusUpdated (CONFIRMED) to customer_${customerInfo.userId}`);
            }
        } catch (err) {
            console.error("Socket broadcast failed in acceptPickup:", err);
        }

        // 4. Generate a pickup verification OTP (agent presents to customer at pickup)
        const existingOtp = await tx.deliveryOTP.findFirst({
            where: {
                deliveryId: delivery.id,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        let otpToSend = existingOtp?.otpCode;
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
        const customerPhone = specificAddress?.receiverPhone || customerInfo?.user?.phone || customerInfo?.addresses?.[0]?.receiverPhone;
        const customerName = specificAddress?.receiverName || customerInfo?.user?.fullName || customerInfo?.addresses?.[0]?.receiverName;
        const agentPhone = agent.user?.phone || agent.phone;
        const orderNum = orderInfo?.orderNumber || delivery.orderId;

        if (customerPhone && otpToSend) {
            console.log(`📱 [Pickup OTP SMS] Sending OTP ${otpToSend} with agent phone ${agentPhone} to customer phone: ${customerPhone} for Order ${orderNum}`);
            SMSService.sendPickupOTP(customerPhone, otpToSend, orderNum, customerName, agentPhone).catch((err) => {
                console.error("[Pickup SMS Error]:", err);
            });
        } else {
            console.warn(`⚠️ [Pickup OTP SMS] Could not send SMS for Order ${orderNum}: Customer phone number not found in profile or address.`);
        }

        return updated;
    });

    console.log("ACCEPTED PICKUP DELIVERY:", updatedDelivery);
    return updatedDelivery;
};

export const getPickupQRCodes = async (
  userId: string,
  deliveryId: string
) => {
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

  return garmentItems.map((gi) => ({
    garmentId: gi.id,
    garmentName: gi.garmentName,
    qrCode: gi.qrCodeRecord?.qrCode || null,
    status: gi.status,
  }));
};