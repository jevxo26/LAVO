import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOtherOrders() {
  const targetUser = await prisma.user.findFirst({
    where: { email: 'mahmudulhaquerifat@gmail.com' },
    include: { customer: true }
  });

  if (!targetUser || !targetUser.customer) {
    console.error('❌ Target customer Md. Mahmudul Hoque Rifat not found!');
    return;
  }

  const rifatCustomerId = targetUser.customer.id;
  console.log(`🎯 Retaining orders for Customer: ${targetUser.fullName} (ID: ${rifatCustomerId})`);

  // Find all orders to be deleted
  const ordersToDelete = await prisma.order.findMany({
    where: {
      customerId: { not: rifatCustomerId }
    },
    select: { id: true, orderNumber: true }
  });

  const deleteIds = ordersToDelete.map((o) => o.id);
  console.log(`🗑️ Found ${deleteIds.length} orders to delete...`);

  if (deleteIds.length === 0) {
    console.log('✅ No other orders to delete.');
    return;
  }

  // 1. Find all OrderItem IDs
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: { in: deleteIds } },
    select: { id: true }
  });
  const orderItemIds = orderItems.map((oi) => oi.id);

  // 2. Find all GarmentItem IDs
  const garmentItems = await prisma.garmentItem.findMany({
    where: { orderItemId: { in: orderItemIds } },
    select: { id: true }
  });
  const garmentItemIds = garmentItems.map((gi) => gi.id);

  // 3. Find all Delivery IDs
  const deliveries = await prisma.delivery.findMany({
    where: { orderId: { in: deleteIds } },
    select: { id: true }
  });
  const deliveryIds = deliveries.map((d) => d.id);

  console.log(`Deleting dependencies for ${deleteIds.length} orders...`);

  // Perform cascading deletes in proper dependency order
  await prisma.$transaction([
    // Garment scan & QR relations
    prisma.garmentScanHistory.deleteMany({ where: { garmentItemId: { in: garmentItemIds } } }),
    prisma.garmentQRCode.deleteMany({ where: { garmentItemId: { in: garmentItemIds } } }),
    prisma.garmentItem.deleteMany({ where: { id: { in: garmentItemIds } } }),
    prisma.orderItem.deleteMany({ where: { id: { in: orderItemIds } } }),

    // Delivery & verification relations
    prisma.deliveryOTP.deleteMany({ where: { deliveryId: { in: deliveryIds } } }),
    prisma.deliveryVerification.deleteMany({ where: { deliveryId: { in: deliveryIds } } }),
    prisma.delivery.deleteMany({ where: { id: { in: deliveryIds } } }),

    // Payments & reviews
    prisma.payment.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.review.deleteMany({ where: { orderId: { in: deleteIds } } }),

    // Order timelines & assignments
    prisma.vendorAssignment.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.vendorCommission.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderTimeline.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderInstruction.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderInvoice.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderPayment.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderCancellation.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderRefund.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderHistory.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderAttachment.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderNote.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderAnalytics.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.orderLog.deleteMany({ where: { orderId: { in: deleteIds } } }),
    prisma.laundryProcessing.deleteMany({ where: { orderId: { in: deleteIds } } }),

    // Delete the Orders
    prisma.order.deleteMany({ where: { id: { in: deleteIds } } }),
  ]);

  // Reset vendor capacity active order counters
  const vendors = await prisma.vendor.findMany({ select: { id: true, capacity: true } });
  for (const v of vendors) {
    if (v.capacity) {
      const activeCount = await prisma.order.count({
        where: {
          vendorId: v.id,
          orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] }
        }
      });

      const dailyCap = v.capacity.dailyCapacity || 20;
      await prisma.vendorCapacity.update({
        where: { vendorId: v.id },
        data: {
          currentOrders: activeCount,
          availableCapacity: Math.max(0, dailyCap - activeCount)
        }
      });
    }
  }

  const remainingOrders = await prisma.order.count();
  console.log(`🎉 Cleanup Completed! Remaining Orders in System: ${remainingOrders} (All belong to ${targetUser.fullName}).`);
}

cleanupOtherOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
