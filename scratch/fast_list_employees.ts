import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function list() {
  const employees = await prisma.branchEmployee.findMany({
    include: { branch: true }
  });

  const users = await prisma.user.findMany({
    where: { id: { in: employees.map(e => e.employeeId) } }
  });

  const userMap = new Map(users.map(u => [u.id, u]));
  const result: Record<string, any[]> = {};

  for (const emp of employees) {
    const user = userMap.get(emp.employeeId);
    const key = emp.branch?.branchName || 'Unknown';
    if (!result[key]) result[key] = [];
    result[key].push({ email: user?.email || '-', userId: emp.employeeId, empId: emp.id });
  }

  let output = '## Employees Per Branch\n\n';
  output += '**All employee accounts use password: `password123`**\n\n';
  for (const [branch, emps] of Object.entries(result)) {
    output += `### ${branch}\n| Email | Employee ID | User ID |\n|-------|-------------|---------|\n`;
    emps.forEach(e => {
      output += `| \`${e.email}\` | \`${e.empId}\` | \`${e.userId}\` |\n`;
    });
    output += '\n';
  }

  fs.writeFileSync('C:\\Users\\Rifat\\.gemini\\antigravity\\brain\\4e0e21c3-1211-4556-a4a4-4af3b87fe5f1\\scratch\\employees.md', output);
  console.log('Saved to employees.md');
}

list().catch(console.error).finally(() => prisma.$disconnect());
