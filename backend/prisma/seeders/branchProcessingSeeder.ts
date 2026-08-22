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

const createGarmentWithQR = async (orderItemId: string, index: number, garmentName: string) => {
  const garmentCode = `GAR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const garment = await prisma.garmentItem.create({
    data: { orderItemId, garmentCode, garmentName, status: 'RECEIVED' }
  });
  
  if (index % 2 === 0) {
    await prisma.garmentQRCode.create({
      data: {
        garmentItemId: garment.id,
        qrCode: `LAVO-${garmentCode}-${Date.now()}`,
        isPrinted: true,
        scanCount: 0,
      }
    });
  }
};

async function main() {
  console.log('Seeding branch processing data...');

  const branch = await findOrCreateBranch();
  const customer = await findOrCreateCustomer();
  const address = await findOrCreateAddress(customer.id);

  let gCategory = await prisma.garmentCategory.findFirst();
  if (!gCategory) {
    gCategory = await prisma.garmentCategory.create({ data: { name: 'Men Tops' } });
  }

  let garmentType = await prisma.garmentType.findFirst();
  if (!garmentType) {
    garmentType = await prisma.garmentType.create({
      data: { categoryId: gCategory.id, name: 'Shirt', unitType: 'Piece' }
    });
  }

  let sCategory = await prisma.serviceCategory.findFirst();
  if (!sCategory) {
    sCategory = await prisma.serviceCategory.create({ data: { name: 'Washing' } });
  }

  let service = await prisma.service.findFirst();
  if (!service) {
    service = await prisma.service.create({
      data: { serviceCategoryId: sCategory.id, garmentTypeId: garmentType.id, serviceName: 'Wash & Iron', basePrice: 150 }
    });
  }

  for (let i = 0; i < 5; i++) {
    const order = await createOrder(customer.id, branch.id, address.id, i);
    const orderItem = await prisma.orderItem.create({
      data: { orderId: order.id, serviceId: service.id, garmentTypeId: garmentType.id, quantity: 2, unitPrice: 250, totalPrice: 500 }
    });
    
    await createGarmentWithQR(orderItem.id, 0, 'White Cotton Shirt');
    await createGarmentWithQR(orderItem.id, 1, 'Blue Denim Jeans');
  }

  console.log('✅ 5 Orders with Garment Items and QRs created successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
