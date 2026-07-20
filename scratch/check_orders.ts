import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLatestOrder() {
  const latestOrders = await prisma.$queryRaw`
    SELECT o.id, o."orderNumber", o."orderStatus", o."branchId", b."branchName", c."fullName" as customerName
    FROM "Order" o
    LEFT JOIN "Branch" b ON o."branchId" = b.id
    LEFT JOIN "User" c ON o."customerId" = c.id
    ORDER BY o."createdAt" DESC
    LIMIT 5;
  `;

  console.log("=== LATEST 5 ORDERS ===");
  console.log(latestOrders);
}

checkLatestOrder().catch(console.error).finally(() => prisma.$disconnect());
