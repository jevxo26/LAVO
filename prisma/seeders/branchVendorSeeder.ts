import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedBranchVendors() {
  console.log('🌱 Starting Branch Vendor Seeding (3 Vendors per Branch across 8 Divisions)...');

  const passwordHash = await bcrypt.hash('Lavo@2026', 10);

  // Get all active branches
  const branches = await prisma.branch.findMany({
    where: { status: 'ACTIVE' }
  });

  if (branches.length === 0) {
    console.warn('⚠️ No active branches found. Please ensure branches exist first.');
    return;
  }

  let totalVendorsCreated = 0;

  for (const branch of branches) {
    const slug = branch.branchCode.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (let i = 1; i <= 3; i++) {
      const email = `vendor${i}_${slug}@laundrix.com`;
      const phone = `+88018${Math.floor(10000000 + Math.random() * 90000000)}`;
      const vendorCode = `VND-${slug.toUpperCase()}-00${i}`;
      const businessName = `${branch.branchName} Partner Wash ${i}`;
      const ownerName = `Vendor ${i} (${branch.branchName})`;

      // 1. Upsert User account for Vendor
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          password: passwordHash,
          userType: 'VENDOR',
          status: 'ACTIVE',
          isVerified: true
        },
        create: {
          email,
          fullName: ownerName,
          phone,
          password: passwordHash,
          userType: 'VENDOR',
          status: 'ACTIVE',
          isVerified: true
        }
      });

      // 2. Upsert Vendor Record
      let vendor = await prisma.vendor.findFirst({
        where: { email: user.email }
      });

      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: {
            vendorCode,
            businessName,
            ownerName,
            email: user.email,
            phone: user.phone || phone,
            status: 'ACTIVE',
            isVerified: true,
          }
        });
      } else {
        vendor = await prisma.vendor.update({
          where: { id: vendor.id },
          data: { status: 'ACTIVE' }
        });
      }

      // 3. Upsert VendorBranch relation linking Vendor to Main Branch
      const existingVendorBranch = await prisma.vendorBranch.findFirst({
        where: { vendorId: vendor.id }
      });

      if (!existingVendorBranch) {
        await prisma.vendorBranch.create({
          data: {
            vendorId: vendor.id,
            branchName: businessName,
            branchCode: `${vendorCode}-BR`,
            country: 'Bangladesh',
            city: branch.city || 'Dhaka',
            division: branch.division || null,
            district: branch.district || null,
            address: branch.address || 'Vendor Hub',
            status: 'ACTIVE'
          }
        });
      }

      // 4. Upsert VendorCapacity (Default: 20-30 daily max garments/orders capacity)
      const dailyCapacity = 15 + i * 5; // e.g. 20, 25, 30
      await prisma.vendorCapacity.upsert({
        where: { vendorId: vendor.id },
        update: {
          dailyCapacity,
          maximumCapacity: dailyCapacity + 10,
        },
        create: {
          vendorId: vendor.id,
          dailyCapacity,
          currentOrders: 0,
          availableCapacity: dailyCapacity,
          maximumCapacity: dailyCapacity + 10,
        }
      });

      totalVendorsCreated++;
    }

    console.log(`✅ Linked 3 Vendors to Branch: ${branch.branchName}`);
  }

  console.log(`🎉 Branch Vendor Seeding Completed! Created/Updated ${totalVendorsCreated} Vendors.`);
}

if (require.main === module) {
  seedBranchVendors()
    .catch((e) => {
      console.error('❌ Error seeding branch vendors:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
