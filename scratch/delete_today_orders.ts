import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jul26Start = new Date('2026-07-25T18:00:00.000Z');

  const orders = await (prisma.order as any).findMany({
    where: { createdAt: { gte: jul26Start } },
    select: { id: true, orderNumber: true, orderStatus: true }
  });

  console.log(`Found ${orders.length} orders from Jul 26:`);
  for (const o of orders) console.log(`  - ${o.orderNumber} | ${o.orderStatus}`);

  if (orders.length === 0) { console.log('Nothing to delete.'); return; }

  const orderIds = orders.map((o: any) => o.id);

  // Get delivery IDs for these orders first
  const deliveries = await (prisma.delivery as any).findMany({
    where: { orderId: { in: orderIds } },
    select: { id: true }
  });
  const deliveryIds = deliveries.map((d: any) => d.id);
  console.log(`\nFound ${deliveryIds.length} deliveries to clean up...`);

  // Delete in correct dependency order
  if (deliveryIds.length > 0) {
    const otpDel = await (prisma.deliveryOTP as any).deleteMany({ where: { deliveryId: { in: deliveryIds } } });
    console.log(`  Deleted ${otpDel.count} DeliveryOTPs`);

    const verDel = await (prisma.deliveryVerification as any).deleteMany({ where: { deliveryId: { in: deliveryIds } } });
    console.log(`  Deleted ${verDel.count} DeliveryVerifications`);
  }

  const delDel = await (prisma.delivery as any).deleteMany({ where: { orderId: { in: orderIds } } });
  console.log(`  Deleted ${delDel.count} Deliveries`);

  const tlDel = await (prisma.orderTimeline as any).deleteMany({ where: { orderId: { in: orderIds } } });
  console.log(`  Deleted ${tlDel.count} OrderTimelines`);

  const payDel = await (prisma.payment as any).deleteMany({ where: { orderId: { in: orderIds } } });
  console.log(`  Deleted ${payDel.count} Payments`);

  // Get orderItem IDs to delete garmentItems
  const items = await (prisma.orderItem as any).findMany({
    where: { orderId: { in: orderIds } },
    select: { id: true }
  });
  const itemIds = items.map((i: any) => i.id);
  if (itemIds.length > 0) {
    const gDel = await (prisma.garmentItem as any).deleteMany({ where: { orderItemId: { in: itemIds } } });
    console.log(`  Deleted ${gDel.count} GarmentItems`);
  }

  const oDel = await (prisma.orderItem as any).deleteMany({ where: { orderId: { in: orderIds } } });
  console.log(`  Deleted ${oDel.count} OrderItems`);

  const finalDel = await (prisma.order as any).deleteMany({ where: { id: { in: orderIds } } });
  console.log(`\n✅ Deleted ${finalDel.count} orders from Jul 26!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
