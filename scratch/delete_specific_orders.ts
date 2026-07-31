import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orderNumbers = [
    'ORD-1785002389348',
    'ORD-1785001226415',
    'ORD-1785001022623',
  ];

  const orders = await (prisma.order as any).findMany({
    where: { orderNumber: { in: orderNumbers } },
    select: { id: true, orderNumber: true, orderStatus: true }
  });

  console.log(`Found ${orders.length} orders:`);
  for (const o of orders) console.log(`  - ${o.orderNumber} | ${o.orderStatus}`);

  if (orders.length === 0) { console.log('Nothing to delete.'); return; }

  const orderIds = orders.map((o: any) => o.id);

  const deliveries = await (prisma.delivery as any).findMany({
    where: { orderId: { in: orderIds } },
    select: { id: true }
  });
  const deliveryIds = deliveries.map((d: any) => d.id);

  if (deliveryIds.length > 0) {
    const o1 = await (prisma.deliveryOTP as any).deleteMany({ where: { deliveryId: { in: deliveryIds } } });
    const o2 = await (prisma.deliveryVerification as any).deleteMany({ where: { deliveryId: { in: deliveryIds } } });
    console.log(`  Deleted ${o1.count} OTPs, ${o2.count} Verifications`);
  }

  const d1 = await (prisma.delivery as any).deleteMany({ where: { orderId: { in: orderIds } } });
  const d2 = await (prisma.orderTimeline as any).deleteMany({ where: { orderId: { in: orderIds } } });
  const d3 = await (prisma.payment as any).deleteMany({ where: { orderId: { in: orderIds } } });
  console.log(`  Deleted ${d1.count} Deliveries, ${d2.count} Timelines, ${d3.count} Payments`);

  const items = await (prisma.orderItem as any).findMany({
    where: { orderId: { in: orderIds } },
    select: { id: true }
  });
  const itemIds = items.map((i: any) => i.id);
  if (itemIds.length > 0) {
    const g = await (prisma.garmentItem as any).deleteMany({ where: { orderItemId: { in: itemIds } } });
    console.log(`  Deleted ${g.count} GarmentItems`);
  }

  await (prisma.orderItem as any).deleteMany({ where: { orderId: { in: orderIds } } });
  const final = await (prisma.order as any).deleteMany({ where: { id: { in: orderIds } } });
  console.log(`\n✅ Deleted ${final.count} orders!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
