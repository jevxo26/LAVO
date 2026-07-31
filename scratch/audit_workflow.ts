import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'mahmudulhaquerifat@gmail.com' },
    include: { customer: { include: { addresses: true } } }
  });

  if (!user || !user.customer) {
    console.log('User Rifat not found');
    return;
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.customer.id },
    include: {
      deliveries: true,
      items: { include: { garmentItems: { include: { qrCodeRecord: true } } } },
      branch: true,
      vendor: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`=== CUSTOMER ORDERS AUDIT (${orders.length}) ===`);
  for (const o of orders) {
    console.log(`\n📦 Order Number: ${o.orderNumber} (ID: ${o.id})`);
    console.log(`   Status: ${o.orderStatus} | Payment: ${o.paymentStatus} | Total: ${o.grandTotal} BDT`);
    console.log(`   Pickup Addr ID: ${o.pickupAddressId} | Delivery Addr ID: ${o.deliveryAddressId}`);
    console.log(`   Branch: ${o.branch?.branchName || 'NONE'} | Vendor: ${o.vendor?.businessName || 'NONE'}`);
    console.log(`   Deliveries (${o.deliveries.length}):`);
    for (const d of o.deliveries) {
      console.log(`     - [${d.deliveryType}] Status: ${d.deliveryStatus} | AgentID: ${d.assignedAgentId || 'UNASSIGNED'} | AddrID: ${d.deliveryAddressId}`);
    }
    const garmentCount = o.items.reduce((acc, i) => acc + i.garmentItems.length, 0);
    console.log(`   Garments (${garmentCount}):`);
    for (const item of o.items) {
      for (const gi of item.garmentItems) {
        console.log(`     * ${gi.garmentName} (Code: ${gi.garmentCode}) -> Status: ${gi.status} | QR: ${gi.qrCodeRecord?.qrCode || 'NONE'}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
