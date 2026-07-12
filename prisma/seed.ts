import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@lavo.com';

  // Upsert — safe to run multiple times
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✓ Super Admin already exists (${email}) — skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash('Lavo@Admin26', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin',
      email,
      password: hashedPassword,
      userType: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  console.log(`✅ Super Admin seeded:`);
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Password : Lavo@Admin26`);
  console.log(`   Role     : ${admin.userType}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
