import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function list() {
  const employees = await prisma.branchEmployee.findMany();

  const result: Record<string, Array<{ email: string, userId: string, empId: string }>> = {};

  for (const emp of employees) {
    const branch = await prisma.branch.findUnique({ where: { id: emp.branchId } });
    const user = await prisma.user.findUnique({ where: { id: emp.employeeId } });
    const key = branch?.branchName || 'Unknown';
    if (!result[key]) result[key] = [];
    result[key].push({ email: user?.email || '-', userId: emp.employeeId, empId: emp.id });
  }

  console.log('\n========== EMPLOYEES PER BRANCH ==========');
  for (const [branch, emps] of Object.entries(result)) {
    console.log(`\nBranch: ${branch}`);
    emps.forEach(e => {
      console.log(`  Emp Record ID: ${e.empId} | User ID: ${e.userId} | Email: ${e.email} | Password: password123`);
    });
  }
}

list().catch(console.error).finally(() => prisma.$disconnect());
