import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function seed() {
  // Get first branch
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    console.error('❌ No branch found. Run npm run seed first.');
    return;
  }
  console.log(`✓ Using branch: ${branch.branchName} (${branch.id})`);

  // ─── 1. EMPLOYEES ─────────────────────────────────────────────────────────
  const employeeData = [
    { name: 'Arif Hossain',   email: 'arif@lavo.com',   designation: 'Washing Specialist',  type: 'Full-time', salary: 18000 },
    { name: 'Sadia Islam',    email: 'sadia@lavo.com',   designation: 'Ironing Specialist',  type: 'Full-time', salary: 16000 },
    { name: 'Rasel Ahmed',    email: 'rasel@lavo.com',   designation: 'Quality Inspector',   type: 'Full-time', salary: 20000 },
    { name: 'Mou Akter',      email: 'mou@lavo.com',     designation: 'Folding Operator',    type: 'Part-time', salary: 10000 },
    { name: 'Karim Uddin',    email: 'karim@lavo.com',   designation: 'Dry Clean Operator',  type: 'Full-time', salary: 22000 },
  ];

  for (const emp of employeeData) {
    let user = await prisma.user.findUnique({ where: { email: emp.email } });
    if (!user) {
      const hashed = await bcrypt.hash('Lavo@1234', 10);
      user = await prisma.user.create({
        data: {
          fullName: emp.name,
          email: emp.email,
          password: hashed,
          userType: 'Employee',
          status: 'ACTIVE',
          isVerified: true,
        },
      });
    }

    const exists = await prisma.branchEmployee.findFirst({
      where: { branchId: branch.id, employeeId: user.id },
    });
    if (!exists) {
      await prisma.branchEmployee.create({
        data: {
          branchId: branch.id,
          employeeId: user.id,
          designation: emp.designation,
          employmentType: emp.type,
          salary: emp.salary,
          joiningDate: new Date('2024-01-15'),
          status: 'ACTIVE',
        },
      });
      console.log(`✅ Employee created: ${emp.name} — ${emp.designation}`);
    } else {
      console.log(`✓  Employee already exists: ${emp.name}`);
    }
  }

  // ─── 2. INVENTORY ─────────────────────────────────────────────────────────
  const inventoryData = [
    { itemName: 'Detergent Powder',    category: 'Chemicals',   quantity: 200, unit: 'kg',     minStock: 50,  currentStock: 200 },
    { itemName: 'Fabric Softener',     category: 'Chemicals',   quantity: 100, unit: 'litre',  minStock: 20,  currentStock: 100 },
    { itemName: 'Bleach Solution',     category: 'Chemicals',   quantity: 60,  unit: 'litre',  minStock: 15,  currentStock: 60  },
    { itemName: 'Washing Bags',        category: 'Consumables', quantity: 500, unit: 'pieces', minStock: 100, currentStock: 500 },
    { itemName: 'Stain Remover Spray', category: 'Chemicals',   quantity: 80,  unit: 'litre',  minStock: 20,  currentStock: 80  },
    { itemName: 'Packaging Plastic',   category: 'Consumables', quantity: 1000, unit: 'rolls', minStock: 200, currentStock: 1000 },
    { itemName: 'Iron Board Cover',    category: 'Equipment',   quantity: 10,  unit: 'pieces', minStock: 3,   currentStock: 10  },
    { itemName: 'Hangers',             category: 'Consumables', quantity: 300, unit: 'pieces', minStock: 50,  currentStock: 300 },
  ];

  for (const item of inventoryData) {
    const exists = await prisma.branchInventory.findFirst({
      where: { branchId: branch.id, itemName: item.itemName },
    });
    if (!exists) {
      await prisma.branchInventory.create({
        data: {
          branchId: branch.id,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          minimumStock: item.minStock,
          currentStock: item.currentStock,
          status: 'ACTIVE',
        },
      });
      console.log(`✅ Inventory item created: ${item.itemName}`);
    } else {
      console.log(`✓  Inventory already exists: ${item.itemName}`);
    }
  }

  // ─── 3. DELIVERY AGENTS ───────────────────────────────────────────────────
  const agentData = [
    { name: 'Rahim Molla',    email: 'rahim.agent@lavo.com',   phone: '01711111111', vehicle: 'Motorcycle', plate: 'DHA-1001' },
    { name: 'Habib Rahman',   email: 'habib.agent@lavo.com',   phone: '01722222222', vehicle: 'Bicycle',    plate: 'DHA-2002' },
    { name: 'Nusrat Jahan',   email: 'nusrat.agent@lavo.com',  phone: '01733333333', vehicle: 'Motorcycle', plate: 'DHA-3003' },
  ];

  for (const agent of agentData) {
    let user = await prisma.user.findUnique({ where: { email: agent.email } });
    if (!user) {
      const hashed = await bcrypt.hash('Lavo@1234', 10);
      user = await prisma.user.create({
        data: {
          fullName: agent.name,
          email: agent.email,
          password: hashed,
          userType: 'Delivery Agent',
          status: 'ACTIVE',
          isVerified: true,
        },
      });
    }

    const exists = await prisma.deliveryAgent.findFirst({ where: { userId: user.id } });
    if (!exists) {
      const newAgent = await prisma.deliveryAgent.create({
        data: {
          userId: user.id,
          employeeCode: `AGT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          phone: agent.phone,
          availability: true,
          status: 'ACTIVE',
        },
      });
      // Create vehicle for agent
      await prisma.deliveryVehicle.create({
        data: {
          agentId: newAgent.id,
          vehicleType: agent.vehicle,
          vehicleNumber: agent.plate,
          status: 'ACTIVE',
        },
      });
      console.log(`✅ Delivery Agent created: ${agent.name} (${agent.vehicle} — ${agent.plate})`);
    } else {
      console.log(`✓  Delivery Agent already exists: ${agent.name}`);
    }
  }

  console.log('\n🎉 Branch dummy data seeding complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
