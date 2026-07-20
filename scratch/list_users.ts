import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function list() {
  // Fetch all branch managers with their branch and user
  const managers = await prisma.branchManager.findMany();

  console.log('\n========== BRANCH MANAGERS ==========');
  for (const m of managers) {
    const branch = await prisma.branch.findUnique({ where: { id: m.branchId } });
    const user = await prisma.user.findUnique({ where: { id: m.userId } });
    console.log(`Branch: ${branch?.branchName}`);
    console.log(`  BranchManager Record ID: ${m.id}`);
    console.log(`  User ID: ${m.userId}`);
    console.log(`  Email: ${user?.email}`);
    console.log(`  Password: password123`);
    console.log('');
  }

  // Fetch all delivery agents
  const agents = await prisma.deliveryAgent.findMany();

  console.log('\n========== DELIVERY AGENTS ==========');
  const byBranch: Record<string, Array<{ agent: typeof agents[0], user: any }>> = {};

  for (const a of agents) {
    const branch = await prisma.branch.findUnique({ where: { id: a.branchId || '' } });
    const user = await prisma.user.findUnique({ where: { id: a.userId } });
    const key = branch?.branchName || 'Unknown';
    if (!byBranch[key]) byBranch[key] = [];
    byBranch[key].push({ agent: a, user });
  }

  for (const [branch, entries] of Object.entries(byBranch)) {
    console.log(`\nBranch: ${branch}`);
    entries.forEach(({ agent, user }) => {
      console.log(`  DeliveryAgent ID: ${agent.id} | User ID: ${agent.userId} | Email: ${user?.email} | Password: password123`);
    });
  }
}

list().catch(console.error).finally(() => prisma.$disconnect());
