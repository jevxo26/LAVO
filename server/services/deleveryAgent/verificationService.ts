import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getVerificationList = async (userId: string) => {
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
    const address =
      delivery.customer.addresses.find((a) => a.isDefault) ??
      delivery.customer.addresses[0];

    return {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      customerName: delivery.customer.user.fullName,
      customerPhone: delivery.customer.user.phone,
      deliveryAddress: address?.fullAddress ?? "N/A",
      deliveryStatus: delivery.deliveryStatus,
      verificationStatus:
        delivery.verifications.length > 0 &&
          delivery.verifications[0].verifiedAt
          ? "VERIFIED"
          : "PENDING",
    };
  });
};

export const verifyDeliveryOTP = async (
  userId: string,
  deliveryId: string,
  otp: string
) => {
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

  const deliveryOtp =
    await prisma.deliveryOTP.findFirst({
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

  await prisma.delivery.update({
    where: {
      id: deliveryId,
    },
    data: {
      deliveryStatus: "DELIVERIED",
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