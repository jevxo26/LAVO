import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find all orders that are still pending/confirmed (waiting for pickup or processing)
  const pendingOrders = await prisma.order.findMany({
    where: {
      orderStatus: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: { id: true, orderNumber: true, orderStatus: true }
  });

  console.log(`Found ${pendingOrders.length} pending/confirmed orders to remove:`);
  for (const o of pendingOrders) {
    console.log(`- ${o.orderNumber} (ID: ${o.id})`);
  }

  const orderIds = pendingOrders.map(o => o.id);

  if (orderIds.length > 0) {
    const deliveries = await prisma.delivery.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
    const deliveryIds = deliveries.map(d => d.id);

    const orderItems = await prisma.orderItem.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
    const orderItemIds = orderItems.map(oi => oi.id);

    const garmentItems = await prisma.garmentItem.findMany({ where: { orderItemId: { in: orderItemIds } }, select: { id: true } });
    const garmentItemIds = garmentItems.map(gi => gi.id);

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

    console.log(`✅ Successfully deleted ${orderIds.length} pending orders from database!`);
  } else {
    console.log('No pending orders found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
