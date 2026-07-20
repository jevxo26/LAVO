import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkBranches() {
  const branches = await prisma.branch.findMany({
    select: { id: true, branchName: true, latitude: true, longitude: true, status: true }
  });
  console.table(branches);
}

checkBranches().catch(console.error).finally(() => prisma.$disconnect());
