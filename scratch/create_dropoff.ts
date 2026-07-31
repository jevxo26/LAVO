import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst({
    where: { orderNumber: { contains: '1784997168761' } },
  });

  if (!order) {
    console.log('Order not found');
    return;
  }

  // Check again if drop-off already exists
  const existing = await prisma.delivery.findFirst({
    where: { orderId: order.id, deliveryType: 'DROP_OFF' }
  });

  if (existing) {
    console.log(`DROP_OFF already exists: ${existing.id} (${existing.deliveryStatus})`);
    return;
  }

  // Create the DROP_OFF delivery record
  const delivery = await prisma.delivery.create({
    data: {
      orderId: order.id,
      customerId: order.customerId,
      branchId: order.branchId!,
      deliveryNumber: `DEL-${Date.now().toString().slice(-6)}-${order.orderNumber}`,
      deliveryType: 'DROP_OFF',
      deliveryStatus: 'PENDING',
      assignedAgentId: null,
      deliveryAddressId: order.deliveryAddressId,
    }
  });

  console.log(`✅ DROP_OFF delivery created!`);
  console.log(`   Delivery ID: ${delivery.id}`);
  console.log(`   Order: ${order.orderNumber}`);
  console.log(`   Branch: ${order.branchId}`);
  console.log(`   Status: ${delivery.deliveryStatus}`);
  console.log(`   Agents can now self-claim this from Available Deliveries!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
