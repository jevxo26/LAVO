import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst({
    where: { orderNumber: { contains: '1784997168761' } },
    include: {
      deliveries: true,
      items: { include: { garmentItems: true } },
      customer: { include: { user: true } }
    }
  });

  if (!order) {
    console.log('Order not found');
    return;
  }

  console.log(`📦 Order: ${order.orderNumber}`);
  console.log(`   Status: ${order.orderStatus}`);
  console.log(`   BranchId: ${order.branchId}`);
  console.log(`   CustomerId: ${order.customerId}`);
  console.log(`   DeliveryAddressId: ${order.deliveryAddressId}`);
  console.log(`   Deliveries (${order.deliveries.length}):`);
  for (const d of order.deliveries) {
    console.log(`   - Type: ${d.deliveryType} | Status: ${d.deliveryStatus} | Agent: ${d.assignedAgentId || 'UNASSIGNED'}`);
  }

  const garments = order.items.flatMap(i => i.garmentItems);
  console.log(`   Garments (${garments.length}):`);
  for (const g of garments) {
    console.log(`   - Garment ID: ${g.id} | Status: ${g.status}`);
  }

  // Try to manually check if a DROP_OFF exists
  const dropoff = await prisma.delivery.findFirst({
    where: { orderId: order.id, deliveryType: 'DROP_OFF' }
  });
  console.log(`\n   DROP_OFF delivery exists: ${dropoff ? `YES (ID: ${dropoff.id}, Status: ${dropoff.deliveryStatus})` : 'NO — needs to be created!'}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
