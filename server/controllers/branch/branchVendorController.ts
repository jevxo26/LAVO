import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { getBranchOrFail } from '../../services/branchDashboardService';

const prisma = new PrismaClient();

export class BranchVendorController {
  /**
   * Get all 3 vendors linked to the manager's branch with real-time capacity and active order counts.
   */
  static getBranchVendors = catchAsync(async (req: any, res: Response) => {
    const branchId = await getBranchOrFail(req);
    const search = (req.query.search as string) || '';

    // 1. Fetch vendors linked to this branch
    const vendors = (await prisma.vendor.findMany({
      where: {
        branchId,
        status: 'ACTIVE',
        ...(search
          ? {
              OR: [
                { businessName: { contains: search, mode: 'insensitive' } },
                { vendorCode: { contains: search, mode: 'insensitive' } },
                { ownerName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      } as any,
      include: {
        capacity: true,
        profile: true,
        orders: {
          where: {
            orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] },
          },
          select: { id: true, orderNumber: true, totalGarments: true, grandTotal: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })) as any[];

    // 2. Format vendors data
    const formattedVendors = vendors.map((v) => {
      const dailyCapacity = v.capacity?.dailyCapacity || 20;
      const currentOrders = v.orders.length;
      const availableCapacity = Math.max(0, dailyCapacity - currentOrders);
      const isFull = availableCapacity <= 0;

      return {
        id: v.id,
        vendorCode: v.vendorCode,
        businessName: v.businessName,
        ownerName: v.ownerName,
        email: v.email,
        phone: v.phone,
        status: v.status,
        logo: v.profile?.logo || null,
        dailyCapacity,
        currentOrders,
        availableCapacity,
        maximumCapacity: v.capacity?.maximumCapacity || dailyCapacity + 10,
        isFull,
        activeOrders: v.orders,
      };
    });

    // 3. Count total active/pending orders in the branch to check overflow (> 5 orders)
    const branchTotalOrders = await prisma.order.count({
      where: {
        branchId,
        orderStatus: { in: ['PENDING', 'CONFIRMED', 'PICKUP', 'PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] },
      },
    });

    const unassignedBranchOrders = await prisma.order.findMany({
      where: {
        branchId,
        vendorId: null,
        orderStatus: { in: ['PENDING', 'CONFIRMED', 'PICKUP', 'PROCESSING'] },
      },
      select: {
        id: true,
        orderNumber: true,
        totalGarments: true,
        grandTotal: true,
        orderStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const OVERFLOW_THRESHOLD = 5;
    const isOverflow = branchTotalOrders > OVERFLOW_THRESHOLD;

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Branch vendors fetched successfully',
      data: {
        vendors: formattedVendors,
        branchStats: {
          branchTotalOrders,
          unassignedOrdersCount: unassignedBranchOrders.length,
          overflowThreshold: OVERFLOW_THRESHOLD,
          isOverflow,
        },
        unassignedOrders: unassignedBranchOrders,
      },
    });
  });

  /**
   * Assign an overflow branch order to a specific vendor with capacity validation.
   */
  static assignOrderToVendor = catchAsync(async (req: any, res: Response) => {
    const branchId = await getBranchOrFail(req);
    const { orderId, vendorId } = req.body;

    if (!orderId || !vendorId) {
      sendResponse(res, { statusCode: 400, success: false, message: 'orderId and vendorId are required' });
      return;
    }

    // 1. Verify Order belongs to branch
    const order = await prisma.order.findFirst({
      where: { id: orderId, branchId },
    });

    if (!order) {
      sendResponse(res, { statusCode: 404, success: false, message: 'Order not found in your branch' });
      return;
    }

    // 2. Verify Vendor belongs to branch and has available capacity
    const vendor = (await prisma.vendor.findFirst({
      where: { id: vendorId, branchId, status: 'ACTIVE' } as any,
      include: { capacity: true },
    })) as any;

    if (!vendor) {
      sendResponse(res, { statusCode: 404, success: false, message: 'Vendor not found or inactive in your branch' });
      return;
    }

    const dailyCap = vendor.capacity?.dailyCapacity || 20;
    const currentActiveCount = await prisma.order.count({
      where: {
        vendorId,
        orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] },
      },
    });

    if (currentActiveCount >= dailyCap) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `Vendor ${vendor.businessName} has reached maximum daily capacity (${dailyCap} orders). Please select another vendor.`,
      });
      return;
    }

    // 3. Assign order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          vendorId,
          orderStatus: order.orderStatus === 'PENDING' ? 'PROCESSING' : order.orderStatus,
        },
      });

      // Update VendorCapacity
      const newCurrentOrders = currentActiveCount + 1;
      const newAvailable = Math.max(0, dailyCap - newCurrentOrders);

      await tx.vendorCapacity.upsert({
        where: { vendorId },
        update: {
          currentOrders: newCurrentOrders,
          availableCapacity: newAvailable,
        },
        create: {
          vendorId,
          dailyCapacity: dailyCap,
          currentOrders: newCurrentOrders,
          availableCapacity: newAvailable,
          maximumCapacity: dailyCap + 10,
        },
      });

      // Create VendorAssignment tracking record
      await tx.vendorAssignment.create({
        data: {
          vendorId,
          orderId,
          assignedBy: req.user?.userId || req.user?.id || 'BRANCH_MANAGER',
          branchId,
          status: 'ACCEPTED',
        },
      });

      // Create OrderTimeline entry (customer-facing neutral description)
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: updatedOrder.orderStatus,
          description: "Your garments are currently undergoing sorting and professional garment processing.",
        },
      });

      return updatedOrder;
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Order #${order.orderNumber} successfully assigned to ${vendor.businessName}!`,
      data: result,
    });
  });
}
