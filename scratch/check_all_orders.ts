import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      deliveries: true,
      customer: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`=== ALL ORDERS IN DB (${orders.length}) ===`);
  for (const o of orders) {
    console.log(`- Order: ${o.orderNumber} (ID: ${o.id}) | Customer: ${o.customer?.user?.fullName} | OrderStatus: ${o.orderStatus} | Payment: ${o.paymentStatus} | Deliveries: ${o.deliveries.map(d => `${d.deliveryType}:${d.deliveryStatus}`).join(', ')}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
