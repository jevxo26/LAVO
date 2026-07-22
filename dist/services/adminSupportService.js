"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSupportService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdminSupportService {
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
    static async replyToReview(reviewId, replyText, adminId) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new Error("Review not found");
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
    static async createAnnouncement(data) {
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
exports.AdminSupportService = AdminSupportService;
