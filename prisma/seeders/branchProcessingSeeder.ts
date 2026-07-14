import crypto from 'crypto';
import prisma, { findOrCreateBranch, findOrCreateCustomer, findOrCreateAddress } from './seederHelpers';

const createOrder = async (customerId: string, branchId: string, addressId: string, i: number) => {
  return prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-${i}`,
      customerId,
      branchId,
      orderStatus: 'PROCESSING',
      orderType: 'REGULAR',
      orderSource: 'APP',
      pickupAddressId: addressId,
      deliveryAddressId: addressId,
      subtotal: 500,
      grandTotal: 550,
    }
  });
};

const createGarmentWithQR = async (orderItemId: string, index: number) => {
  const garmentCode = `GAR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const garment = await prisma.garmentItem.create({
    data: { orderItemId, garmentCode, garmentName: `Shirt ${index + 1}`, status: 'WASHING' }
  });
  await prisma.garmentQRCode.create({
    data: {
      garmentItemId: garment.id,
      qrCode: `QR-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      isPrinted: true,
      scanCount: 1,
    }
  });
};

async function main() {
  console.log('Seeding branch processing data...');

  const branch = await findOrCreateBranch();
  const customer = await findOrCreateCustomer();
  const address = await findOrCreateAddress(customer.id);

  const service = await prisma.service.findFirst();
  const garmentType = await prisma.garmentType.findFirst();
  if (!service || !garmentType) { console.warn('No service/garmentType found. Skipping orders.'); return; }

  for (let i = 0; i < 5; i++) {
    const order = await createOrder(customer.id, branch.id, address.id, i);
    const orderItem = await prisma.orderItem.create({
      data: { orderId: order.id, serviceId: service.id, garmentTypeId: garmentType.id, quantity: 2, unitPrice: 250, totalPrice: 500 }
    });
    await createGarmentWithQR(orderItem.id, 0);
    await createGarmentWithQR(orderItem.id, 1);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
