import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { runCmsSeeder } from "./seeders/cmsSeeder";

const prisma = new PrismaClient();

const generateCode = (prefix: string) => `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

async function main() {
  console.log("Starting LAVO database seed...");

  const passwordHash = await bcrypt.hash("Lavo@2026", 10);

  // Helper to upsert a user
  async function upsertUser(email: string, fullName: string, userType: string, phone: string) {
    return prisma.user.upsert({
      where: { email },
      update: {
        password: passwordHash,
        status: "ACTIVE",
        isVerified: true,
        userType, // Ensure role is updated if it already exists
      },
      create: {
        email,
        fullName,
        phone,
        password: passwordHash,
        userType,
        status: "ACTIVE",
        isVerified: true,
      },
    });
  }

  // 1. Create Users
  console.log("Seeding Super Admin and Admin...");
  await upsertUser("superadmin@lavo.com", "Super Admin", "SUPER_ADMIN", "+8801700000000");
  await upsertUser("admin@lavo.com", "System Admin", "ADMIN", "+8801700000001");

  console.log("Seeding Vendors...");
  const vendor1User = await upsertUser("vendor1@lavo.com", "Vendor One", "VENDOR", "+8801700000011");
  const vendor2User = await upsertUser("vendor2@lavo.com", "Vendor Two", "VENDOR", "+8801700000012");

  console.log("Seeding Branch Managers...");
  const bm1User = await upsertUser("branchmanager1@lavo.com", "Branch Manager 1", "BRANCH_MANAGER", "+8801700000021");
  const bm2User = await upsertUser("branchmanager2@lavo.com", "Branch Manager 2", "BRANCH_MANAGER", "+8801700000022");

  console.log("Seeding Employees...");
  const emp1User = await upsertUser("employee1@lavo.com", "Employee 1", "EMPLOYEE", "+8801700000031");
  const emp2User = await upsertUser("employee2@lavo.com", "Employee 2", "EMPLOYEE", "+8801700000032");

  console.log("Seeding Delivery Agents...");
  const agent1User = await upsertUser("agent1@lavo.com", "Delivery Agent 1", "DELIVERY_AGENT", "+8801700000041");
  const agent2User = await upsertUser("agent2@lavo.com", "Delivery Agent 2", "DELIVERY_AGENT", "+8801700000042");

  console.log("Seeding Customers...");
  const customerUsers = [];
  for (let i = 1; i <= 10; i++) {
    const cust = await upsertUser(`customer${i}@lavo.com`, `Customer ${i}`, "CUSTOMER", `+880170000005${i}`);
    customerUsers.push(cust);
  }

  // 2. Create Vendors
  console.log("Creating Vendor Profiles...");
  const vendor1 = await prisma.vendor.upsert({
    where: { email: vendor1User.email },
    update: {},
    create: {
      vendorCode: "VND-001",
      businessName: "Clean & Fresh Hub",
      ownerName: "Vendor One",
      email: vendor1User.email,
      phone: vendor1User.phone as string,
      isVerified: true,
      status: "ACTIVE",
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { email: vendor2User.email },
    update: {},
    create: {
      vendorCode: "VND-002",
      businessName: "Premium Wash Care",
      ownerName: "Vendor Two",
      email: vendor2User.email,
      phone: vendor2User.phone as string,
      isVerified: true,
      status: "ACTIVE",
    },
  });

  // 3. Create Branches
  console.log("Creating Branches...");
  const branch1 = await prisma.branch.upsert({
    where: { branchCode: "BR-001" },
    update: {},
    create: {
      branchCode: "BR-001",
      branchName: "Dhaka Central",
      branchType: "Head Office",
      country: "Bangladesh",
      city: "Dhaka",
      address: "Dhanmondi, Dhaka",
      managerId: bm1User.id,
      status: "ACTIVE",
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { branchCode: "BR-002" },
    update: {},
    create: {
      branchCode: "BR-002",
      branchName: "Gulshan Branch",
      branchType: "Regional",
      country: "Bangladesh",
      city: "Dhaka",
      address: "Gulshan 2, Dhaka",
      managerId: bm2User.id,
      status: "ACTIVE",
    },
  });

  // Connect Branches to Vendors (VendorBranch)
  await prisma.vendorBranch.upsert({
    where: { branchCode: "VB-001" },
    update: {},
    create: {
      vendorId: vendor1.id,
      branchCode: "VB-001",
      branchName: branch1.branchName,
      country: "Bangladesh",
      city: "Dhaka",
      address: "Dhanmondi, Dhaka",
      managerName: bm1User.fullName,
    }
  });

  await prisma.vendorBranch.upsert({
    where: { branchCode: "VB-002" },
    update: {},
    create: {
      vendorId: vendor2.id,
      branchCode: "VB-002",
      branchName: branch2.branchName,
      country: "Bangladesh",
      city: "Dhaka",
      address: "Gulshan 2, Dhaka",
      managerName: bm2User.fullName,
    }
  });

  // 4. Create Employees
  console.log("Creating Branch Employees...");
  const empIds = [emp1User.id, emp2User.id];
  for (let i = 0; i < empIds.length; i++) {
    const bId = i % 2 === 0 ? branch1.id : branch2.id;
    // use findFirst since there is no unique constraint we can easily upsert against without full unique composites
    const existing = await prisma.branchEmployee.findFirst({ where: { employeeId: empIds[i] } });
    if (!existing) {
      await prisma.branchEmployee.create({
        data: {
          branchId: bId,
          employeeId: empIds[i],
          designation: "Staff",
          status: "ACTIVE",
        }
      });
    }
  }

  // 5. Create Delivery Agents
  console.log("Creating Delivery & Pickup Agents...");
  const agents = [agent1User, agent2User];
  for (let i = 0; i < agents.length; i++) {
    const code = `AGT-00${i+1}`;
    await prisma.deliveryAgent.upsert({
      where: { userId: agents[i].id },
      update: {},
      create: {
        userId: agents[i].id,
        employeeCode: code,
        phone: agents[i].phone as string,
        availability: true,
        status: "ACTIVE",
      }
    });

    await prisma.pickupAgent.upsert({
      where: { userId: agents[i].id },
      update: {},
      create: {
        userId: agents[i].id,
        employeeCode: `PKG-${code}`,
        phone: agents[i].phone as string,
        availability: true,
        status: "ACTIVE",
      }
    });
  }

  // 6. Create Customer Profiles
  console.log("Creating Customer Profiles...");
  const createdCustomers = [];
  for (const cUser of customerUsers) {
    const code = generateCode("CUST");
    const cust = await prisma.customer.upsert({
      where: { userId: cUser.id },
      update: {},
      create: {
        userId: cUser.id,
        customerCode: code,
        status: "ACTIVE",
      }
    });
    createdCustomers.push(cust);

    await prisma.customerProfile.upsert({
      where: { customerId: cust.id },
      update: {},
      create: {
        customerId: cust.id,
        fullName: cUser.fullName,
        email: cUser.email,
        phone: cUser.phone as string,
      }
    });

    // Create a default address
    const existingAddress = await prisma.customerAddress.findFirst({ where: { customerId: cust.id } });
    if (!existingAddress) {
      await prisma.customerAddress.create({
        data: {
          customerId: cust.id,
          label: "Home",
          receiverName: cUser.fullName,
          receiverPhone: cUser.phone as string,
          city: "Dhaka",
          fullAddress: "Road 10, Dhanmondi",
          isDefault: true,
        }
      });
    }
  }

  // 7. Create Service Categories, Garment Types, and Services
  console.log("Creating Services...");
  const cat = await prisma.serviceCategory.upsert({
    where: { name: "Dry Cleaning" },
    update: {},
    create: { name: "Dry Cleaning", status: "ACTIVE" }
  });

  const garment = await prisma.garmentCategory.upsert({
    where: { name: "Clothing" },
    update: {},
    create: { name: "Clothing", status: "ACTIVE" }
  });

  // GarmentType doesn't have unique constraint on name, search first
  let gType = await prisma.garmentType.findFirst({ where: { name: "Shirt" } });
  if (!gType) {
    gType = await prisma.garmentType.create({
      data: { categoryId: garment.id, name: "Shirt", unitType: "pcs", status: "ACTIVE" }
    });
  }

  const service = await prisma.service.findFirst({ where: { serviceName: "Premium Shirt Dry Clean" } });
  let createdService = service;
  if (!createdService) {
    createdService = await prisma.service.create({
      data: {
        serviceCategoryId: cat.id,
        garmentTypeId: gType.id,
        serviceName: "Premium Shirt Dry Clean",
        basePrice: 150.0,
        status: "ACTIVE",
      }
    });
  }

  // 8. Create Orders
  console.log("Creating Sample Orders...");
  const orderStatuses = ["PENDING", "PROCESSING", "DELIVERED"];
  
  for (let i = 0; i < 20; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const orderNum = generateCode("ORD");
    const address = await prisma.customerAddress.findFirst({ where: { customerId: cust.id } });
    
    if (address) {
      const existingOrder = await prisma.order.findUnique({ where: { orderNumber: orderNum } });
      if (!existingOrder) {
        await prisma.order.create({
          data: {
            orderNumber: orderNum,
            customerId: cust.id,
            branchId: i % 2 === 0 ? branch1.id : branch2.id,
            pickupAddressId: address.id,
            deliveryAddressId: address.id,
            orderType: "STANDARD",
            orderSource: "APP",
            totalGarments: 2,
            grandTotal: 300.0,
            paymentStatus: i % 3 === 0 ? "PAID" : "UNPAID",
            orderStatus: orderStatuses[i % 3],
          }
        });
      }
    }
  }

  console.log("Seed completed successfully!");
  
  // Run CMS Seeder
  await runCmsSeeder();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
