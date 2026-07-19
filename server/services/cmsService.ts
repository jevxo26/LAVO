import { PrismaClient } from "@prisma/client";
import { catchServiceAsync } from "../utils/catchServiceAsync";

const prisma = new PrismaClient();

export const createOrUpdatePage = catchServiceAsync(async (data: { slug: string, title: string, description?: string, status?: string }) => {
  const page = await prisma.cmsPage.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      description: data.description,
      status: data.status,
    },
    create: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      status: data.status || "PUBLISHED",
    }
  });
  return page;
});

export const getPageBySlug = catchServiceAsync(async (slug: string) => {
  return await prisma.cmsPage.findUnique({
    where: { slug },
    include: {
      sections: {
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        },
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
});

export const getAllPages = catchServiceAsync(async () => {
  return await prisma.cmsPage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sections: {
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        },
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
});

export const updateSection = catchServiceAsync(async (data: { pageId: string, sectionKey: string, title?: string, subtitle?: string, content?: string, image?: string, displayOrder?: number }) => {
  return await prisma.cmsSection.upsert({
    where: {
      pageId_sectionKey: {
        pageId: data.pageId,
        sectionKey: data.sectionKey
      }
    },
    update: {
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      image: data.image,
      displayOrder: data.displayOrder
    },
    create: {
      pageId: data.pageId,
      sectionKey: data.sectionKey,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      image: data.image,
      displayOrder: data.displayOrder || 0
    }
  });
});

export const createContentItem = catchServiceAsync(async (data: { sectionId: string, title?: string, subtitle?: string, content?: string, icon?: string, image?: string, linkUrl?: string, linkText?: string, displayOrder?: number }) => {
  return await prisma.cmsContentItem.create({
    data
  });
});

export const updateContentItem = catchServiceAsync(async (id: string, data: any) => {
  return await prisma.cmsContentItem.update({
    where: { id },
    data
  });
});

export const deleteContentItem = catchServiceAsync(async (id: string) => {
  return await prisma.cmsContentItem.delete({
    where: { id }
  });
});
