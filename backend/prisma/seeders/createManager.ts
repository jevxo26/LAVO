import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createBranchManager() {
  const email = 'manager@lavo.com';
  const password = await bcrypt.hash('Lavo@Manager26', 10);

  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: 'Test Branch Manager',
        email,
        password,
        userType: 'Branch Manager', // Based on the userType used in the frontend and auth check
        status: 'ACTIVE',
        isVerified: true
      }
    });
    console.log(`✅ Created Branch Manager user: ${email}`);
  } else {
    console.log(`✓ Branch Manager already exists (${email})`);
  }

  // Assign to first branch if not already assigned
  const branch = await prisma.branch.findFirst();
  if (branch) {
    await prisma.branch.update({
      where: { id: branch.id },
      data: { managerId: user.id }
    });
    console.log(`✅ Assigned ${email} as manager of branch: ${branch.branchName}`);
  } else {
    console.log('❌ No branch found. Run npm run seed first.');
  }
}

createBranchManager()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
