"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContentItem = exports.updateContentItem = exports.createContentItem = exports.updateSection = exports.getAllPages = exports.getPageBySlug = exports.createOrUpdatePage = void 0;
const client_1 = require("@prisma/client");
const catchServiceAsync_1 = require("../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
exports.createOrUpdatePage = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
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
exports.getPageBySlug = (0, catchServiceAsync_1.catchServiceAsync)(async (slug) => {
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
exports.getAllPages = (0, catchServiceAsync_1.catchServiceAsync)(async () => {
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
exports.updateSection = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
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
exports.createContentItem = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    return await prisma.cmsContentItem.create({
        data
    });
});
exports.updateContentItem = (0, catchServiceAsync_1.catchServiceAsync)(async (id, data) => {
    return await prisma.cmsContentItem.update({
        where: { id },
        data
    });
});
exports.deleteContentItem = (0, catchServiceAsync_1.catchServiceAsync)(async (id) => {
    return await prisma.cmsContentItem.delete({
        where: { id }
    });
});
