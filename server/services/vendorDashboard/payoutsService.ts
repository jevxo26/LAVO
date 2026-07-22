import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { getVendorByUserId } from './overviewService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PayoutRow {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  requestedAt: Date;
  paidAt: Date | null;
}

export interface PayoutsResult {
  data: PayoutRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface RequestPayoutData {
  amount: number;
  paymentMethod: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getPayouts = async (
  userId: string,
  page: number,
  limit: number,
  status: string,
): Promise<PayoutsResult> => {
  const vendor = await getVendorByUserId(userId);
  const skip = (page - 1) * limit;

  // Build a fully-typed where clause — no `any`
  const where: Prisma.VendorPayoutWhereInput = { vendorId: vendor.id };
  if (status && status !== 'ALL') {
    where.paymentStatus = status;
  }

  const [payouts, total] = await Promise.all([
    prisma.vendorPayout.findMany({
      where,
      skip,
      take: limit,
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.vendorPayout.count({ where }),
  ]);

  return {
    data: payouts.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      requestedAt: p.requestedAt,
      paidAt: p.paidAt ?? null,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const requestPayout = async (
  userId: string,
  data: RequestPayoutData,
) => {
  const vendor = await getVendorByUserId(userId);

  const wallet = await prisma.vendorWallet.findUnique({
    where: { vendorId: vendor.id },
  });
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.currentBalance < data.amount)
    throw new Error('Insufficient balance for payout request');

  return prisma.vendorPayout.create({
    data: {
      vendorId: vendor.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'PENDING',
    },
  });
};
