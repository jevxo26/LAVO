import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Users
  const password = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@laundrix.com' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'admin@laundrix.com',
      phone: '01700000000',
      password,
      userType: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Admin user created.');

  const customer = await prisma.user.upsert({
    where: { email: 'customer@laundrix.com' },
    update: {},
    create: {
      fullName: 'Jane Customer',
      email: 'customer@laundrix.com',
      phone: '01711111111',
      password,
      userType: 'CUSTOMER',
      status: 'ACTIVE'
    }
  });

  const branchManagerUser = await prisma.user.upsert({
    where: { email: 'manager@laundrix.com' },
    update: {},
    create: {
      fullName: 'John Manager',
      email: 'manager@laundrix.com',
      phone: '01722222222',
      password,
      userType: 'BRANCH_MANAGER',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Dummy users created.');

  // 2. Create Branch
  const branch = await prisma.branch.upsert({
    where: { branchCode: 'BR-DHK-01' },
    update: {},
    create: {
      branchCode: 'BR-DHK-01',
      branchName: 'Dhaka Central',
      branchType: 'MAIN',
      managerId: branchManagerUser.id,
      phone: branchManagerUser.phone || '000',
      address: 'Gulshan 1, Dhaka',
      country: 'Bangladesh',
      city: 'Dhaka',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Dummy branch created.');

  // 3. Create Service Category & Service
  const category = await prisma.serviceCategory.upsert({
    where: { name: 'Premium Cleaning' },
    update: {},
    create: { name: 'Premium Cleaning' }
  });
  
  const gCategory = await prisma.garmentCategory.upsert({
    where: { name: 'Formal Wear' },
    update: {},
    create: { name: 'Formal Wear' }
  });

  let gType = await prisma.garmentType.findFirst({ where: { name: 'Suit' }});
  if (!gType) {
    gType = await prisma.garmentType.create({
      data: { name: 'Suit', categoryId: gCategory.id, unitType: 'PIECE' }
    });
  }

  let service = await prisma.service.findFirst({ where: { serviceName: '2-Piece Suit Dry Clean' }});
  if (!service) {
    service = await prisma.service.create({
      data: {
        serviceName: '2-Piece Suit Dry Clean',
        serviceCategoryId: category.id,
        garmentTypeId: gType.id,
        basePrice: 250,
        status: 'ACTIVE'
      }
    });
  }
  console.log('✅ Dummy laundry service created.');

  // 4. Create Vendor
  const vendor = await prisma.vendor.upsert({
    where: { vendorCode: 'VEN-01' },
    update: {},
    create: {
      vendorCode: 'VEN-01',
      businessName: 'Quality Cleaners',
      ownerName: 'Bob Vendor',
      email: 'bob@quality.com',
      phone: '01733333333',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Dummy vendor created.');

  // 5. Create Logistics (Agent & Vehicle)
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@laundrix.com' },
    update: {},
    create: {
      fullName: 'Speedy Delivery',
      email: 'agent@laundrix.com',
      phone: '01744444444',
      password,
      userType: 'DELIVERY_AGENT',
      status: 'ACTIVE'
    }
  });

  const agent = await prisma.deliveryAgent.upsert({
    where: { employeeCode: 'AG-01' },
    update: {},
    create: {
      userId: agentUser.id,
      employeeCode: 'AG-01',
      phone: agentUser.phone || '000',
      status: 'ACTIVE'
    }
  });

  const vehicle = await prisma.deliveryVehicle.upsert({
    where: { vehicleNumber: 'DHK-11-2222' },
    update: {},
    create: {
      agentId: agent.id,
      vehicleType: 'Van',
      vehicleNumber: 'DHK-11-2222',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Dummy logistics created.');

  // 6. Create Finance (Tax & Delivery Charge Rules)
  let taxRule = await prisma.taxRule.findFirst({ where: { taxName: 'Standard VAT' }});
  if (!taxRule) {
    await prisma.taxRule.create({
      data: {
        taxName: 'Standard VAT',
        country: 'Bangladesh',
        taxPercentage: 15,
        status: 'ACTIVE'
      }
    });
  }

  let chargeRule = await prisma.deliveryChargeRule.findFirst({ where: { ruleName: 'Inside Dhaka Standard' }});
  if (!chargeRule) {
    await prisma.deliveryChargeRule.create({
      data: {
        ruleName: 'Inside Dhaka Standard',
        baseCharge: 60,
        distanceCharge: 10,
        weightCharge: 5,
        status: 'ACTIVE'
      }
    });
  }
  console.log('✅ Dummy finance rules created.');

  // 7. Create Support (Ticket & Review)
  const dummyCustomer = await prisma.customer.upsert({
    where: { customerCode: 'CUS-01' },
    update: {},
    create: {
      userId: customer.id,
      customerCode: 'CUS-01'
    }
  });

  const categoryTicket = await prisma.ticketCategory.upsert({
    where: { name: 'General Inquiry' },
    update: {},
    create: { name: 'General Inquiry' }
  });

  await prisma.supportTicket.upsert({
    where: { ticketNumber: 'TCK-001' },
    update: {},
    create: {
      ticketNumber: 'TCK-001',
      customerId: dummyCustomer.id,
      categoryId: categoryTicket.id,
      subject: 'Where is my order?',
      priority: 'HIGH',
      status: 'OPEN'
    }
  });

  const dummyOrder = await prisma.order.upsert({
    where: { orderNumber: 'ORD-001' },
    update: {},
    create: {
      orderNumber: 'ORD-001',
      customerId: dummyCustomer.id,
      pickupAddressId: 'pickup-01',
      deliveryAddressId: 'delivery-01',
      orderType: 'STANDARD',
      orderSource: 'APP',
      grandTotal: 500,
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED'
    }
  });

  const reviewCount = await prisma.review.count({
    where: { orderId: dummyOrder.id }
  });
  
  if (reviewCount === 0) {
    await prisma.review.create({
      data: {
        customerId: dummyCustomer.id,
        orderId: dummyOrder.id,
        rating: 5,
        review: 'Great service, highly recommended!',
        status: 'PUBLISHED'
      }
    });
  }
  console.log('✅ Dummy support data created.');

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
