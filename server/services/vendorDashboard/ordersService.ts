import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { getVendorByUserId } from './overviewService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  branchName: string;
  orderStatus: string;
  grandTotal: number;
  itemCount: number;
  createdAt: Date;
}

export interface OrdersResult {
  data: OrderRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getOrders = async (
  userId: string,
  page: number,
  limit: number,
  search: string,
  status: string,
): Promise<OrdersResult> => {
  const vendor = await getVendorByUserId(userId);
  const skip = (page - 1) * limit;

  // Build a fully-typed where clause
  const where: Prisma.OrderWhereInput = { vendorId: vendor.id };

  if (status && status !== 'ALL') {
    where.orderStatus = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
      {
        customer: {
          user: {
            fullName: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
        },
      },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        branch: true,
        items: true, // OrderItem[] — relation name is `items` in orders.prisma
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer?.user?.fullName ?? 'Unknown',
      customerPhone: o.customer?.user?.phone ?? '',
      branchName: o.branch?.branchName ?? '',
      orderStatus: o.orderStatus,
      grandTotal: o.grandTotal,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  newStatus: string,
) => {
  const vendor = await getVendorByUserId(userId);
  const order = await prisma.order.findFirst({
    where: { id: orderId, vendorId: vendor.id },
  });
  if (!order) throw new Error('Order not found or not assigned to this vendor');

  return prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: newStatus },
  });
};

export const acceptOrder = async (userId: string, orderId: string) => {
  const vendor = await getVendorByUserId(userId);
  const assignment = await prisma.vendorAssignment.findFirst({
    where: { vendorId: vendor.id, orderId, status: 'PENDING' },
  });
  if (!assignment) throw new Error('Assignment not found or already processed');

  return prisma.vendorAssignment.update({
    where: { id: assignment.id },
    data: { status: 'ACCEPTED', acceptedAt: new Date() },
  });
};

export const rejectOrder = async (
  userId: string,
  orderId: string,
  reason: string,
) => {
  const vendor = await getVendorByUserId(userId);
  const assignment = await prisma.vendorAssignment.findFirst({
    where: { vendorId: vendor.id, orderId, status: 'PENDING' },
  });
  if (!assignment) throw new Error('Assignment not found or already processed');

  // Log the rejection reason in the order history then update assignment
  await prisma.orderHistory.create({
    data: {
      orderId,
      action: 'VENDOR_REJECTED',
      performedBy: vendor.id,
      description: reason || 'No reason provided',
    },
  });

  return prisma.vendorAssignment.update({
    where: { id: assignment.id },
    data: { status: 'REJECTED' },
  });
};
