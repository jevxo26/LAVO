"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedReviews = exports.deleteReview = exports.updateReview = exports.createReview = exports.getAllReviews = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllReviews = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { review: { contains: search, mode: 'insensitive' } },
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
    const formattedReviews = reviews.map(r => {
        var _a, _b;
        return ({
            id: r.id,
            customer: ((_b = (_a = r.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) || 'Unknown Customer',
            rating: r.rating,
            comment: r.review,
            status: r.status === 'PUBLISHED' ? 'Published' : r.status === 'HIDDEN' ? 'Hidden' : 'Pending',
        });
    });
    return {
        data: formattedReviews,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllReviews = getAllReviews;
const createReview = async (data) => {
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
        });
    }
    let order = await prisma.order.findFirst();
    if (!order) {
        let service = await prisma.service.findFirst();
        if (!service) {
            let cat = await prisma.serviceCategory.create({ data: { name: 'Standard Cleaning' } });
            let gcat = await prisma.garmentCategory.create({ data: { name: 'General' } });
            let gt = await prisma.garmentType.create({ data: { categoryId: gcat.id, name: 'Standard', unitType: 'PIECE' } });
            service = await prisma.service.create({ data: { serviceName: 'Test Service', serviceCategoryId: cat.id, garmentTypeId: gt.id, basePrice: 50, status: 'ACTIVE' } });
        }
        order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`,
                customerId: customer.id,
                orderStatus: 'DELIVERED',
                paymentStatus: 'PAID',
                grandTotal: 100,
                // TODO: Replace hardcoded dummy addresses with actual user addresses
                pickupAddressId: 'dummy_pickup',
                deliveryAddressId: 'dummy_delivery',
                orderType: 'STANDARD',
                orderSource: 'WEB',
            }
        });
    }
    const newReview = await prisma.review.create({
        data: {
            customerId: customer.id,
            orderId: order.id,
            rating: Number(data.rating),
            review: data.comment,
            status: data.status ? data.status.toUpperCase() : 'PUBLISHED',
        },
    });
    return newReview;
};
exports.createReview = createReview;
const updateReview = async (id, data) => {
    const updateData = {};
    if (data.rating)
        updateData.rating = Number(data.rating);
    if (data.comment)
        updateData.review = data.comment;
    if (data.status)
        updateData.status = data.status.toUpperCase();
    const updated = await prisma.review.update({
        where: { id },
        data: updateData,
    });
    return updated;
};
exports.updateReview = updateReview;
const deleteReview = async (id) => {
    return await prisma.review.delete({
        where: { id },
    });
};
exports.deleteReview = deleteReview;
// ─── Public: published reviews for homepage testimonials ─────────────────────
const getPublishedReviews = async (limit = 8) => {
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
    return reviews.map((r) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return ({
            id: r.id,
            customerName: ((_b = (_a = r.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) || 'Customer',
            initials: (((_d = (_c = r.customer) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.fullName) || 'CU')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase(),
            rating: r.rating,
            comment: r.review,
            title: r.title || null,
            serviceName: ((_h = (_g = (_f = (_e = r.order) === null || _e === void 0 ? void 0 : _e.items) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.service) === null || _h === void 0 ? void 0 : _h.serviceName) || 'Laundry Service',
            createdAt: r.createdAt,
        });
    });
};
exports.getPublishedReviews = getPublishedReviews;
