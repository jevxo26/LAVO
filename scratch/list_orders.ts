import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = await (prisma.order as any).findMany({
    select: { id: true, orderNumber: true, orderStatus: true, createdAt: true }
  });

  console.log(`Total orders in DB: ${orders.length}`);
  for (const o of orders) {
    console.log(`  - ${o.orderNumber} | ${o.orderStatus} | ${o.createdAt}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
