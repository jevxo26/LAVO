import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deliveries = await (prisma.delivery as any).findMany({
    where: {
      deliveryType: 'PICKUP',
      deliveryStatus: 'IN_PROGRESS',
    },
    include: {
      order: { select: { orderNumber: true, pickupAddressId: true } },
      customer: {
        include: {
          user: { select: { fullName: true, phone: true } },
          addresses: { select: { id: true, receiverName: true, receiverPhone: true, isDefault: true } }
        }
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  }) as any[];

  if (deliveries.length === 0) {
    console.log('No IN_PROGRESS pickup deliveries found.');
    return;
  }

  for (const d of deliveries) {
    const otp = await (prisma.deliveryOTP as any).findFirst({
      where: { deliveryId: d.id, isUsed: false, expiresAt: { gt: new Date() } }
    });

    const agent = d.assignedAgentId ? await (prisma.deliveryAgent as any).findUnique({
      where: { id: d.assignedAgentId },
      include: { user: { select: { fullName: true, phone: true } } }
    }) : null;

    const orderAddressId = d.order?.pickupAddressId;
    const specificAddress = d.customer?.addresses?.find((a: any) => a.id === orderAddressId);
    const fallback = d.customer?.addresses?.find((a: any) => a.isDefault) || d.customer?.addresses?.[0];
    const usedAddress = specificAddress || fallback;
    const customerPhone = usedAddress?.receiverPhone || d.customer?.user?.phone;

    console.log(`\n📦 Delivery: ${d.id}`);
    console.log(`   Order: ${d.order?.orderNumber}`);
    console.log(`   Agent: ${agent?.user?.fullName || 'N/A'} | Phone: ${agent?.user?.phone || 'N/A'}`);
    console.log(`   Customer user phone: ${d.customer?.user?.phone || '❌ NOT SET'}`);
    console.log(`   Pickup address ID on order: ${orderAddressId || '❌ NOT SET'}`);
    console.log(`   Address used: ${usedAddress?.receiverName || 'N/A'} | receiverPhone: ${usedAddress?.receiverPhone || '❌ NOT SET'}`);
    console.log(`   📱 Phone SMS goes to: ${customerPhone || '❌ NO PHONE — SMS SKIPPED'}`);
    console.log(`   🔑 Valid OTP in DB: ${otp ? otp.otpCode : '❌ NO OTP IN DB'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
