import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllReviews = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { review: { contains: search, mode: 'insensitive' as any } },
        ],
      }
    : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }),
  ]);

  const formattedReviews = reviews.map(r => ({
    id: r.id,
    customer: r.customer?.user?.fullName || 'Unknown Customer',
    rating: r.rating,
    comment: r.review,
    status: r.status === 'PUBLISHED' ? 'Published' : r.status === 'HIDDEN' ? 'Hidden' : 'Pending',
  }));

  return {
    data: formattedReviews,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createReview = async (data: any) => {
  let customer = await prisma.customer.findFirst();
  if (!customer) {
    const newUser = await prisma.user.create({
      data: {
        fullName: data.customer || 'Guest',
        email: `${Date.now()}@customer.com`,
        phone: `017${Math.floor(Math.random() * 100000000)}`,
        password: 'dummy',
        userType: 'CUSTOMER'
      }
    });
    customer = await prisma.customer.create({
      data: { userId: newUser.id, customerCode: `CUS-${Date.now()}` }
    }) as any;
  }

  let order = await prisma.order.findFirst();
  if (!order) {
    let service = await prisma.service.findFirst();
    if (!service) {
        let cat = await prisma.serviceCategory.create({ data: { name: 'Standard Cleaning' }});
        let gcat = await prisma.garmentCategory.create({ data: { name: 'General' }});
        let gt = await prisma.garmentType.create({ data: { categoryId: gcat.id, name: 'Standard', unitType: 'PIECE' }});
        service = await prisma.service.create({ data: { serviceName: 'Test Service', serviceCategoryId: cat.id, garmentTypeId: gt.id, basePrice: 50, status: 'ACTIVE' }});
    }
    
    order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId: customer!.id,
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        grandTotal: 100,
        // TODO: Replace hardcoded dummy addresses with actual user addresses
        pickupAddressId: 'dummy_pickup',
        deliveryAddressId: 'dummy_delivery',
        orderType: 'STANDARD',
        orderSource: 'WEB',
      }
    }) as any;
  }

  const newReview = await prisma.review.create({
    data: {
      customerId: customer!.id,
      orderId: order!.id,
      rating: Number(data.rating),
      review: data.comment,
      status: data.status ? data.status.toUpperCase() : 'PUBLISHED',
    },
  });
  return newReview;
};

export const updateReview = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.rating) updateData.rating = Number(data.rating);
  if (data.comment) updateData.review = data.comment;
  if (data.status) updateData.status = data.status.toUpperCase();

  const updated = await prisma.review.update({
    where: { id },
    data: updateData,
  });
  return updated;
};

export const deleteReview = async (id: string) => {
  return await prisma.review.delete({
    where: { id },
  });
};

// ─── Public: published reviews for homepage testimonials ─────────────────────

export const getPublishedReviews = async (limit: number = 8) => {
  const reviews = await prisma.review.findMany({
    where: { status: 'PUBLISHED' },
    take: limit,
    include: {
      customer: { include: { user: true } },
      order: {
        include: {
          items: {
            take: 1,
            include: { service: { select: { serviceName: true } } },
          },
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return reviews.map((r) => ({
    id:           r.id,
    customerName: r.customer?.user?.fullName || 'Customer',
    initials:     (r.customer?.user?.fullName || 'CU')
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase(),
    rating:       r.rating,
    comment:      r.review,
    title:        (r as any).title || null,
    serviceName:  r.order?.items?.[0]?.service?.serviceName || 'Laundry Service',
    createdAt:    r.createdAt,
  }));
};
