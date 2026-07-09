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
  let order = await prisma.order.findFirst();

  if (!order) {
     if(!customer) {
        throw new Error("No customer/order available in DB to attach review to.");
     }
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
