import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

const DIVISIONS = [
  'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 
  'Rangpur', 'Sylhet', 'Barishal', 'Chattogram'
];

async function seed() {
  console.log('Starting division seed...');

  // Delete all existing managers and agents
  await prisma.user.deleteMany({
    where: {
      userType: { in: ['BRANCH_MANAGER', 'DELIVERY_AGENT'] }
    }
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const division of DIVISIONS) {
    // 1. Upsert Branch
    const branchCode = `BR-${division.toUpperCase().substring(0, 3)}`;
    const branch = await prisma.branch.upsert({
      where: { branchCode },
      update: { branchName: `${division} Branch`, city: division, division },
      create: {
        branchCode,
        branchName: `${division} Branch`,
        branchType: 'REGIONAL',
        country: 'Bangladesh',
        division: division,
        city: division,
        address: `${division} Central Area`,
        status: 'ACTIVE',
        latitude: getMockLat(division),
        longitude: getMockLon(division)
      }
    });

    // 2. Create 1 Branch Manager
    const managerUser = await prisma.user.create({
      data: {
        fullName: `${division} Manager`,
        email: `bm_${division.toLowerCase()}@laundrix.com`,
        phone: `+8801700${Math.floor(Math.random() * 1000000)}`,
        password: passwordHash,
        userType: 'BRANCH_MANAGER',
        isVerified: true
      }
    });

    await prisma.branchManager.create({
      data: {
        userId: managerUser.id,
        branchId: branch.id,
        assignedDate: new Date()
      }
    });

    // 3. Create 5 Delivery Agents
    for (let i = 1; i <= 5; i++) {
      const phone = `+8801800${Math.floor(Math.random() * 1000000)}`;
      const agentUser = await prisma.user.create({
        data: {
          fullName: `${division} Agent ${i}`,
          email: `agent${i}_${division.toLowerCase()}@laundrix.com`,
          phone: phone,
          password: passwordHash,
          userType: 'DELIVERY_AGENT',
          isVerified: true
        }
      });

      const agent = await prisma.deliveryAgent.create({
        data: {
          userId: agentUser.id,
          branchId: branch.id,
          employeeCode: `AGT-${division.toUpperCase().substring(0, 3)}-${i}`,
          phone: phone,
          availability: true
        }
      });

      await prisma.deliveryVehicle.create({
        data: {
          agentId: agent.id,
          vehicleType: 'MOTORCYCLE',
          vehicleNumber: `DHK-M-${Math.floor(Math.random() * 9000) + 1000}`
        }
      });
    }
    console.log(`Created Branch, 1 BM, and 5 Agents for ${division}`);
  }
}

function getMockLat(division: string) {
  const coords: Record<string, number> = {
    Dhaka: 23.8103, Khulna: 22.8456, Mymensingh: 24.7471, Rajshahi: 24.3636,
    Rangpur: 25.7439, Sylhet: 24.8949, Barishal: 22.7010, Chattogram: 22.3569
  };
  return coords[division] || 23.8103;
}

function getMockLon(division: string) {
  const coords: Record<string, number> = {
    Dhaka: 90.4125, Khulna: 89.5403, Mymensingh: 90.4203, Rajshahi: 88.6241,
    Rangpur: 89.2752, Sylhet: 91.8687, Barishal: 90.3535, Chattogram: 91.7832
  };
  return coords[division] || 90.4125;
}

seed().catch(console.error).finally(() => prisma.$disconnect());
