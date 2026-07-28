"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePartnerApplication = exports.getAllPartnerApplications = exports.createPartnerApplication = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPartnerApplication = async (userId, data) => {
    return await prisma.partnerApplication.create({
        data: {
            userId,
            phone: data.phone,
            targetCity: data.targetCity,
            experience: data.experience,
            reason: data.reason,
        },
    });
};
exports.createPartnerApplication = createPartnerApplication;
const getAllPartnerApplications = async (page = 1, limit = 10, search = "") => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                {
                    phone: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    targetCity: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    user: {
                        fullName: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    user: {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        }
        : {};
    const [applications, total] = await Promise.all([
        prisma.partnerApplication.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: true,
                reviewedBy: true,
            },
        }),
        prisma.partnerApplication.count({
            where,
        }),
    ]);
    return {
        data: applications,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllPartnerApplications = getAllPartnerApplications;
const updatePartnerApplication = async (id, data, reviewerId) => {
    const application = await prisma.partnerApplication.findUnique({
        where: {
            id
        }
    });
    if (!application) {
        throw new Error("Application not found");
    }
    const result = await prisma.$transaction(async (tx) => {
        const updatedApplication = await tx.partnerApplication.update({
            where: {
                id
            },
            data: {
                status: data.status,
                remarks: data.remarks,
                reviewedById: reviewerId,
                reviewedAt: new Date()
            },
            include: {
                user: true,
                reviewedBy: true
            }
        });
        if (data.status === "APPROVED") {
            await tx.user.update({
                where: {
                    id: application.userId
                },
                data: {
                    userType: "VENDOR"
                }
            });
        }
        return updatedApplication;
    });
    return result;
};
exports.updatePartnerApplication = updatePartnerApplication;
