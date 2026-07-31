import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find all orders where orderStatus is PENDING or paymentStatus is UNPAID or status is PENDING
  const pendingOrders = await prisma.order.findMany({
    where: {
      OR: [
        { orderStatus: 'PENDING' },
        { paymentStatus: 'UNPAID' },
      ]
    },
    include: {
      deliveries: true,
      items: { include: { garmentItems: true } },
      customer: { include: { user: true } }
    }
  });

  console.log(`Found ${pendingOrders.length} pending/unpaid orders to remove:`);
  for (const o of pendingOrders) {
    console.log(`- Order: ${o.orderNumber} (ID: ${o.id}) | Customer: ${o.customer?.user?.fullName} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus}`);
  }

  const orderIds = pendingOrders.map(o => o.id);

  if (orderIds.length > 0) {
    // Collect all child IDs
    const deliveries = await prisma.delivery.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
    const deliveryIds = deliveries.map(d => d.id);

    const orderItems = await prisma.orderItem.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
    const orderItemIds = orderItems.map(oi => oi.id);

    const garmentItems = await prisma.garmentItem.findMany({ where: { orderItemId: { in: orderItemIds } }, select: { id: true } });
    const garmentItemIds = garmentItems.map(gi => gi.id);

    console.log(`\nDeleting related records: ${deliveryIds.length} deliveries, ${garmentItemIds.length} garments...`);

    await prisma.$transaction([
      prisma.deliveryOTP.deleteMany({ where: { deliveryId: { in: deliveryIds } } }),
      prisma.deliveryVerification.deleteMany({ where: { deliveryId: { in: deliveryIds } } }),
      prisma.delivery.deleteMany({ where: { id: { in: deliveryIds } } }),

      prisma.garmentScanHistory.deleteMany({ where: { garmentItemId: { in: garmentItemIds } } }),
      prisma.garmentQRCode.deleteMany({ where: { garmentItemId: { in: garmentItemIds } } }),
      prisma.garmentItem.deleteMany({ where: { id: { in: garmentItemIds } } }),
      prisma.orderItem.deleteMany({ where: { id: { in: orderItemIds } } }),

      prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.review.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.vendorAssignment.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.orderTimeline.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    ]);

    console.log('✅ Successfully removed all pending/unpaid orders!');
  } else {
    console.log('No pending orders found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
