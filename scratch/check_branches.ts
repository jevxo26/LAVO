import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const branches = await prisma.branch.findMany({
    include: {
      managers: true,
      deliveryAgents: true
    }
  });
  console.log(`Branches: ${branches.length}`);
  branches.forEach(b => {
    console.log(`- ${b.branchName} (Managers: ${b.managers.length}, Agents: ${b.deliveryAgents.length})`);
  });

  const allManagers = await prisma.user.count({ where: { userType: 'BRANCH_MANAGER' } });
  const allAgents = await prisma.user.count({ where: { userType: 'DELIVERY_AGENT' } });
  console.log(`Total Branch Managers in User table: ${allManagers}`);
  console.log(`Total Delivery Agents in User table: ${allAgents}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
