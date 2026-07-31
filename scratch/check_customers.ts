import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find the newest customer
  const customers = await (prisma.customer as any).findMany({
    include: {
      user: { select: { fullName: true, phone: true, email: true, createdAt: true } },
      addresses: { select: { id: true, receiverName: true, receiverPhone: true, isDefault: true } },
      orders: { select: { orderNumber: true, orderStatus: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 3 }
    },
    orderBy: { id: 'desc' },
    take: 5
  }) as any[];

  console.log(`=== NEWEST 5 CUSTOMERS ===`);
  for (const c of customers) {
    console.log(`\n👤 Customer: ${c.user?.fullName}`);
    console.log(`   Phone: ${c.user?.phone || '❌ NOT SET'}`);
    console.log(`   Email: ${c.user?.email}`);
    console.log(`   Joined: ${c.user?.createdAt}`);
    console.log(`   Addresses (${c.addresses?.length}):`);
    for (const a of c.addresses || []) {
      console.log(`   - ${a.receiverName} | Phone: ${a.receiverPhone || '❌ NOT SET'} | Default: ${a.isDefault}`);
    }
    console.log(`   Recent Orders:`);
    for (const o of c.orders || []) {
      console.log(`   - ${o.orderNumber} | ${o.orderStatus} | ${o.createdAt}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
