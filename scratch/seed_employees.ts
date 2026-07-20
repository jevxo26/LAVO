import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function seedEmployees() {
  console.log('Seeding 5 employees per branch...');

  // Delete old seeded employees
  await prisma.user.deleteMany({
    where: { userType: 'EMPLOYEE' }
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const branches = await prisma.branch.findMany({
    where: { status: 'ACTIVE' }
  });

  for (const branch of branches) {
    // Use branch id slug as unique key to avoid email conflicts
    const key = branch.id.substring(0, 6);

    for (let i = 1; i <= 5; i++) {
      const phone = `+8801900${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      const email = `emp${i}_${key}@laundrix.com`;

      const user = await prisma.user.create({
        data: {
          fullName: `${branch.branchName} Employee ${i}`,
          email,
          phone,
          password: passwordHash,
          userType: 'EMPLOYEE',
          isVerified: true
        }
      });

      await prisma.branchEmployee.create({
        data: {
          branchId: branch.id,
          employeeId: user.id,
          designation: 'Laundry Technician',
          joiningDate: new Date(),
          salary: 15000,
          employmentType: 'FULL_TIME',
          status: 'ACTIVE'
        }
      });
    }
    console.log(`Added 5 employees to ${branch.branchName}`);
  }

  console.log('Done!');
}

seedEmployees().catch(console.error).finally(() => prisma.$disconnect());
