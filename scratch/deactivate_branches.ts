import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function deactivateOldBranches() {
  const validBranchNames = [
    'Dhaka Branch', 'Khulna Branch', 'Mymensingh Branch', 
    'Rajshahi Branch', 'Rangpur Branch', 'Sylhet Branch', 
    'Barishal Branch', 'Chattogram Branch'
  ];

  const result = await prisma.branch.updateMany({
    where: {
      branchName: {
        notIn: validBranchNames
      }
    },
    data: {
      status: 'INACTIVE'
    }
  });

  console.log(`Deactivated ${result.count} old/test branches.`);
}

deactivateOldBranches().catch(console.error).finally(() => prisma.$disconnect());
