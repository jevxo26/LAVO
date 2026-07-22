import prisma from './prisma';
import { getVendorByUserId } from './overviewService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TransactionRow {
  id: string;
  type: string;
  amount: number;
  status: string;
  referenceId: string | null;
  createdAt: Date;
}

export interface WalletResult {
  walletBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalCommissionDeducted: number;
  status: string;
  recentTransactions: TransactionRow[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getWallet = async (userId: string): Promise<WalletResult> => {
  const vendor = await getVendorByUserId(userId);

  const [wallet, recentTransactions, commissionAgg] = await Promise.all([
    prisma.vendorWallet.findUnique({ where: { vendorId: vendor.id } }),
    prisma.vendorTransaction.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.vendorCommission.aggregate({
      where: { vendorId: vendor.id },
      _sum: { commissionAmount: true },
    }),
  ]);

  return {
    walletBalance: wallet?.currentBalance ?? 0,
    pendingBalance: wallet?.pendingBalance ?? 0,
    totalEarnings: wallet?.totalEarnings ?? 0,
    totalCommissionDeducted: commissionAgg._sum.commissionAmount ?? 0,
    status: wallet?.status ?? 'INACTIVE',
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.transactionType,
      amount: t.amount,
      status: t.status,
      referenceId: t.referenceId ?? null,
      createdAt: t.createdAt,
    })),
  };
};
