import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find customer "Mahmudul Haque Rifat"
  const user = await prisma.user.findFirst({
    where: {
      fullName: { contains: 'Rifat', mode: 'insensitive' }
    },
    include: { customer: true }
  });

  console.log('Target User:', user?.id, user?.fullName, user?.email);
  console.log('Target Customer ID:', user?.customer?.id);

  if (!user || !user.customer) {
    console.error('Customer Mahmudul Haque Rifat not found!');
    return;
  }

  const customerId = user.customer.id;

  // Count total orders
  const totalOrders = await prisma.order.count();
  const rifatOrders = await prisma.order.count({ where: { customerId } });
  const otherOrders = await prisma.order.count({ where: { customerId: { not: customerId } } });

  console.log(`Total Orders: ${totalOrders}, Rifat Orders: ${rifatOrders}, Other Orders: ${otherOrders}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
