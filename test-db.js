const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  console.log(users.map(u => ({ id: u.id, email: u.email, userType: u.userType })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
