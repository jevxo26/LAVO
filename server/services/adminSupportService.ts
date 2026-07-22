import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AdminSupportService {
  static async getAllReviews() {
    return await prisma.review.findMany({
      include: {
        customer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        replies: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async replyToReview(reviewId: string, replyText: string, adminId?: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found");

    return await prisma.reviewReply.create({
      data: {
        reviewId,
        reply: replyText,
        adminId: adminId || null,
      },
    });
  }

  static async getAllAnnouncements() {
    return await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAnnouncement(data: {
    title: string;
    content: string;
    targetType: string;
    startDate: Date;
    endDate?: Date;
  }) {
    return await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        targetType: data.targetType,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: "ACTIVE",
      },
    });
  }
}
