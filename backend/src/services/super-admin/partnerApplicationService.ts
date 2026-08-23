import prisma from "../../config/prisma";
import { PrismaClient } from "@prisma/client";

export const createPartnerApplication = async (
  userId: string,
  data: {
    phone: string;
    targetCity: string;
    experience?: string;
    reason: string;
  }
) => {
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

export const getAllPartnerApplications = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            phone: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            targetCity: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            user: {
              fullName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: "insensitive" as const,
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

export const updatePartnerApplication = async (
  id: string,
  data: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    remarks?: string;
  },
  reviewerId?: string
) => {

  const application = await prisma.partnerApplication.findUnique({
    where:{
      id
    }
  });

  if(!application){
    throw new Error("Application not found");
  }
  const result = await prisma.$transaction(async(tx)=>{
    const updatedApplication =
      await tx.partnerApplication.update({
        where:{
          id
        },
        data:{
          status:data.status,
          remarks:data.remarks,
          reviewedById:reviewerId,
          reviewedAt:new Date()
        },
        include:{
          user:true,
          reviewedBy:true
        }
      });

    if(data.status === "APPROVED"){
      await tx.user.update({
        where:{
          id:application.userId
        },
        data:{
          userType:"VENDOR"
        }
      });
    }
    return updatedApplication;
  });
  return result;
};