import prisma from './prisma';
import { getVendorByUserId } from './overviewService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CapacityResult {
  vendorId: string;
  dailyCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
  maximumCapacity: number;
  utilizationPercent: number;
  status: 'AVAILABLE' | 'NEAR_FULL' | 'FULL' | 'NOT_SET';
}

export interface UpdateCapacityData {
  dailyCapacity?: number;
  maximumCapacity?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getCapacity = async (userId: string): Promise<CapacityResult> => {
  const vendor = await getVendorByUserId(userId);
  const capacity = await prisma.vendorCapacity.findUnique({
    where: { vendorId: vendor.id },
  });

  if (!capacity) {
    return {
      vendorId: vendor.id,
      dailyCapacity: 0,
      usedCapacity: 0,
      remainingCapacity: 0,
      maximumCapacity: 0,
      utilizationPercent: 0,
      status: 'NOT_SET',
    };
  }

  const used = capacity.currentOrders;
  const remaining = Math.max(capacity.dailyCapacity - used, 0);
  const utilizationPercent =
    capacity.dailyCapacity > 0
      ? Math.min((used / capacity.dailyCapacity) * 100, 100)
      : 0;

  let status: CapacityResult['status'] = 'AVAILABLE';
  if (utilizationPercent >= 100) status = 'FULL';
  else if (utilizationPercent >= 80) status = 'NEAR_FULL';

  return {
    vendorId: vendor.id,
    dailyCapacity: capacity.dailyCapacity,
    usedCapacity: used,
    remainingCapacity: remaining,
    maximumCapacity: capacity.maximumCapacity,
    utilizationPercent: parseFloat(utilizationPercent.toFixed(1)),
    status,
  };
};

export const updateCapacity = async (
  userId: string,
  data: UpdateCapacityData,
) => {
  const vendor = await getVendorByUserId(userId);
  const daily = data.dailyCapacity ?? 50;
  const maximum = data.maximumCapacity ?? 100;

  // VendorCapacity has no `createdAt` field — upsert without it
  return prisma.vendorCapacity.upsert({
    where: { vendorId: vendor.id },
    update: {
      ...(data.dailyCapacity !== undefined && { dailyCapacity: data.dailyCapacity }),
      ...(data.maximumCapacity !== undefined && { maximumCapacity: data.maximumCapacity }),
      // Recalculate availableCapacity when dailyCapacity changes
      ...(data.dailyCapacity !== undefined && {
        availableCapacity: Math.max(data.dailyCapacity, 0),
      }),
    },
    create: {
      vendorId: vendor.id,
      dailyCapacity: daily,
      maximumCapacity: maximum,
      currentOrders: 0,
      availableCapacity: daily,
    },
  });
};
