import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst({
    where: { orderNumber: { contains: '1784899803109' } },
    include: {
      customer: {
        include: {
          user: true,
          addresses: true
        }
      }
    }
  });

  if (!order) {
    console.log('Order ORD-1784899803109 not found');
    return;
  }

  console.log(`📦 Order: ${order.orderNumber}`);
  console.log(`   Pickup Address ID: ${order.pickupAddressId}`);
  console.log(`   Customer User Phone: ${order.customer?.user?.phone}`);
  console.log(`   Customer Addresses (${order.customer?.addresses.length}):`);
  for (const a of order.customer?.addresses || []) {
    console.log(`   - Address ID: ${a.id} | Receiver: ${a.receiverName} | Phone: ${a.receiverPhone} | Address: ${a.fullAddress}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
