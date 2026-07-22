import { PrismaClient } from "@prisma/client";
import { SMSService } from "../smsService";

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
        const customerAddress =
            delivery.customer?.addresses.find(
                addr => addr.isDefault
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
            orderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName:
                delivery.customer?.user?.fullName ?? "N/A",
            customerPhone:
                delivery.customer?.user?.phone ?? "N/A",
            branch:
                delivery.branch?.branchName ?? "N/A",
            pickupAddress:
                customerAddress?.fullAddress ?? "N/A",
            distance:
                distance ? `${distance} KM` : "N/A",
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
            }
        });

    if (!agent) {
        throw new Error(
            "Agent not found"
        );
    }

    const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
            order: {
                include: {
                    customer: {
                        include: {
                            user: { select: { fullName: true, phone: true } }
                        }
                    }
                }
            }
        }
    });

    if (!delivery) {
        throw new Error(
            "Delivery not found"
        );
    }

    if (delivery.assignedAgentId !== null && delivery.assignedAgentId !== agent.id) {
        throw new Error("This delivery has already been accepted by another agent.");
    }

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

        // Trigger Pickup OTP SMS to Customer
        const customerPhone = delivery.order?.customer?.user?.phone;
        const customerName = delivery.order?.customer?.user?.fullName;
        const orderNum = delivery.order?.orderNumber || delivery.orderId;

        if (customerPhone && otpToSend) {
            SMSService.sendPickupOTP(customerPhone, otpToSend, orderNum, customerName).catch((err) => {
                console.error("[Pickup SMS Error]:", err);
            });
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