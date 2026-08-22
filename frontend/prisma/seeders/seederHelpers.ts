import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
export default prisma;

export const findOrCreateBranch = async () => {
  const existing = await prisma.branch.findFirst();
  if (existing) return existing;
  return prisma.branch.create({
    data: {
      branchCode: `BR-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      branchName: 'Main Branch',
      branchType: 'Head Office',
      country: 'Bangladesh',
      city: 'Dhaka',
      address: '123 Laundry St',
      phone: '1234567890',
      status: 'ACTIVE'
    }
  });
};

export const findOrCreateCustomer = async () => {
  const existing = await prisma.customer.findFirst();
  if (existing) return existing;

  let user = await prisma.user.findFirst({ where: { userType: 'CUSTOMER' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: `customer${Date.now()}@test.com`,
        password: 'Password123',
        fullName: 'Test Customer',
        phone: `017${Math.floor(Math.random() * 100000000)}`,
        userType: 'CUSTOMER'
      }
    });
  }

  return prisma.customer.create({
    data: {
      userId: user.id,
      customerCode: `CUST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    }
  });
};

export const findOrCreateAddress = async (customerId: string) => {
  const existing = await prisma.customerAddress.findFirst({ where: { customerId } });
  if (existing) return existing;
  return prisma.customerAddress.create({
    data: {
      customerId,
      receiverName: 'Test Receiver',
      receiverPhone: '01700000000',
      city: 'Dhaka',
      fullAddress: 'Test Address'
    }
  });
};
