import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetUser = await prisma.user.findFirst({
    where: { email: 'mahmudulhaquerifat@gmail.com' },
    include: { customer: true }
  });

  const rifatCustomerId = targetUser?.customer?.id;

  if (!rifatCustomerId) {
    console.error('Customer Mahmudul Haque Rifat not found!');
    return;
  }

  // Find all deliveries for customers OTHER than Rifat
  const deliveriesToDelete = await prisma.delivery.findMany({
    where: {
      customerId: { not: rifatCustomerId }
    },
    select: { id: true, orderId: true }
  });

  const deliveryIds = deliveriesToDelete.map(d => d.id);
  const orphanOrderIds = deliveriesToDelete.map(d => d.orderId).filter(Boolean);

  console.log(`Deleting ${deliveryIds.length} leftover delivery records for non-Rifat test accounts...`);

  if (deliveryIds.length > 0) {
    await prisma.$transaction([
      prisma.deliveryOTP.deleteMany({ where: { deliveryId: { in: deliveryIds } } }),
      prisma.deliveryVerification.deleteMany({ where: { deliveryId: { in: deliveryIds } } }),
      prisma.delivery.deleteMany({ where: { id: { in: deliveryIds } } }),
    ]);
  }

  // Delete leftover test orders for Customer 1 if any
  if (orphanOrderIds.length > 0) {
    const orphanOrders = await prisma.order.findMany({
      where: {
        id: { in: orphanOrderIds },
        customerId: { not: rifatCustomerId }
      },
      select: { id: true }
    });

    const oIds = orphanOrders.map(o => o.id);
    if (oIds.length > 0) {
      console.log(`Deleting ${oIds.length} orphan orders...`);
      const orderItems = await prisma.orderItem.findMany({ where: { orderId: { in: oIds } }, select: { id: true } });
      const orderItemIds = orderItems.map(oi => oi.id);

      const garmentItems = await prisma.garmentItem.findMany({ where: { orderItemId: { in: orderItemIds } }, select: { id: true } });
      const garmentItemIds = garmentItems.map(gi => gi.id);

      await prisma.$transaction([
        prisma.garmentScanHistory.deleteMany({ where: { garmentItemId: { in: garmentItemIds } } }),
        prisma.garmentQRCode.deleteMany({ where: { garmentItemId: { in: garmentItemIds } } }),
        prisma.garmentItem.deleteMany({ where: { id: { in: garmentItemIds } } }),
        prisma.orderItem.deleteMany({ where: { id: { in: orderItemIds } } }),
        prisma.payment.deleteMany({ where: { orderId: { in: oIds } } }),
        prisma.review.deleteMany({ where: { orderId: { in: oIds } } }),
        prisma.vendorAssignment.deleteMany({ where: { orderId: { in: oIds } } }),
        prisma.orderTimeline.deleteMany({ where: { orderId: { in: oIds } } }),
        prisma.order.deleteMany({ where: { id: { in: oIds } } }),
      ]);
    }
  }

  console.log('✅ Cleanup of leftover delivery agent test orders complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
