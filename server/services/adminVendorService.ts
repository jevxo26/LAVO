import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AdminVendorService {
  static async getPendingVerifications() {
    return await prisma.vendor.findMany({
      where: { isVerified: false },
      include: {
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async verifyVendor(vendorId: string, isApproved: boolean, remarks?: string) {
    const status = isApproved ? "ACTIVE" : "REJECTED";
    
    // Update Vendor Verification Status
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        isVerified: isApproved,
        status,
      },
    });

    // Create Verification History Log
    await prisma.vendorVerification.create({
      data: {
        vendorId,
        verifiedBy: "SYSTEM_ADMIN",
        verificationStatus: isApproved ? "APPROVED" : "REJECTED",
        remarks: remarks || "",
      },
    });

    // Initialize wallet if approved and does not exist
    if (isApproved) {
      await prisma.vendorWallet.upsert({
        where: { vendorId },
        update: {},
        create: {
          vendorId,
          currentBalance: 0.0,
          pendingBalance: 0.0,
          totalEarnings: 0.0,
        },
      });
    }

    return vendor;
  }

  static async getPayoutRequests() {
    return await prisma.vendorPayout.findMany({
      include: {
        vendor: true,
      },
      orderBy: { requestedAt: "desc" },
    });
  }

  static async processPayout(payoutId: string, status: "PAID" | "REJECTED") {
    const payout = await prisma.vendorPayout.findUnique({
      where: { id: payoutId },
    });
    if (!payout) throw new Error("Payout request not found");

    const updatedPayout = await prisma.vendorPayout.update({
      where: { id: payoutId },
      data: {
        paymentStatus: status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    if (status === "PAID") {
      // Deduct from Vendor Wallet
      const wallet = await prisma.vendorWallet.findUnique({
        where: { vendorId: payout.vendorId },
      });
      if (wallet) {
        await prisma.vendorWallet.update({
          where: { vendorId: payout.vendorId },
          data: {
            currentBalance: Math.max(0, wallet.currentBalance - payout.amount),
          },
        });
      }
    }

    return updatedPayout;
  }
}
