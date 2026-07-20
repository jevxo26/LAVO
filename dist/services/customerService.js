"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const client_1 = require("@prisma/client");
const catchServiceAsync_1 = require("../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
class CustomerService {
    // Ensure customer, wallet, and loyalty points exist for a given user
    static async getOrCreateCustomer(userId) {
        let customer = await prisma.customer.findUnique({
            where: { userId },
            include: {
                user: true,
                wallets: true,
                loyaltyPointRecord: true,
            },
        });
        if (!customer) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            // Generate customer code
            const customerCode = `CUST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            customer = await prisma.customer.create({
                data: {
                    userId,
                    customerCode,
                    status: 'ACTIVE',
                    customerProfile: {
                        create: {
                            fullName: user.fullName,
                            email: user.email,
                            phone: user.phone || `01700${Math.floor(100000 + Math.random() * 900000)}`,
                        },
                    },
                    wallets: {
                        create: {
                            balance: 0.0,
                            currency: 'BDT',
                            status: 'ACTIVE',
                        },
                    },
                    loyaltyPointRecord: {
                        create: {
                            earnedPoints: 0,
                            redeemedPoints: 0,
                            availablePoints: 0,
                            expiredPoints: 0,
                        },
                    },
                },
                include: {
                    user: true,
                    wallets: true,
                    loyaltyPointRecord: true,
                },
            });
        }
        return customer;
    }
    // Seed demo services & categories if none exist
    static async seedDemoServicesIfEmpty() {
        const serviceCount = await prisma.service.count();
        if (serviceCount > 0)
            return;
        console.log('🌱 Seeding demo laundry services and garment categories...');
        // 1. Create Garment Categories
        const categories = ['Clothing', 'Household', 'Specialty'];
        const createdGarmentCats = {};
        for (const catName of categories) {
            let cat = await prisma.garmentCategory.findUnique({ where: { name: catName } });
            if (!cat) {
                cat = await prisma.garmentCategory.create({
                    data: { name: catName, description: `${catName} laundry items` },
                });
            }
            createdGarmentCats[catName] = cat;
        }
        // 2. Create Garment Types
        const garmentTypesData = [
            { name: 'Shirt', category: 'Clothing', unit: 'PIECE' },
            { name: 'T-Shirt', category: 'Clothing', unit: 'PIECE' },
            { name: 'Pants', category: 'Clothing', unit: 'PIECE' },
            { name: 'Suit', category: 'Clothing', unit: 'PIECE' },
            { name: 'Bedsheet', category: 'Household', unit: 'PIECE' },
            { name: 'Blanket', category: 'Household', unit: 'PIECE' },
            { name: 'Shoes', category: 'Specialty', unit: 'PAIR' },
        ];
        const createdGarmentTypes = {};
        for (const item of garmentTypesData) {
            const parentCat = createdGarmentCats[item.category];
            let gType = await prisma.garmentType.findFirst({
                where: { name: item.name, categoryId: parentCat.id },
            });
            if (!gType) {
                gType = await prisma.garmentType.create({
                    data: { name: item.name, categoryId: parentCat.id, unitType: item.unit },
                });
            }
            createdGarmentTypes[item.name] = gType;
        }
        // 3. Create Service Category
        let serviceCat = await prisma.serviceCategory.findUnique({ where: { name: 'Standard Wash' } });
        if (!serviceCat) {
            serviceCat = await prisma.serviceCategory.create({
                data: { name: 'Standard Wash', description: 'Regular laundry services' },
            });
        }
        // 4. Create Services
        const servicesData = [
            { name: 'Shirt Cleaning', gType: 'Shirt', price: 60.0 },
            { name: 'T-Shirt Wash', gType: 'T-Shirt', price: 40.0 },
            { name: 'Pants Wash & Iron', gType: 'Pants', price: 70.0 },
            { name: 'Suit Dry Clean', gType: 'Suit', price: 350.0 },
            { name: 'Bedsheet Wash', gType: 'Bedsheet', price: 120.0 },
            { name: 'Blanket Wash', gType: 'Blanket', price: 240.0 },
            { name: 'Premium Shoes Polish & Cleaning', gType: 'Shoes', price: 200.0 },
        ];
        for (const s of servicesData) {
            const gType = createdGarmentTypes[s.gType];
            const service = await prisma.service.create({
                data: {
                    serviceName: s.name,
                    serviceCategoryId: serviceCat.id,
                    garmentTypeId: gType.id,
                    basePrice: s.price,
                    status: 'ACTIVE',
                },
            });
            // Add addons
            await prisma.serviceAddon.createMany({
                data: [
                    { serviceId: service.id, addonName: 'Stain Removal', price: 50.0, description: 'Remove tough stains' },
                    { serviceId: service.id, addonName: 'Fabric Softener', price: 20.0, description: 'Adds softness and fragrance' },
                    { serviceId: service.id, addonName: 'Perfume Finish', price: 15.0, description: 'Premium fresh scent' },
                    { serviceId: service.id, addonName: 'Express Service', price: 100.0, description: 'Delivery in 24 hours' },
                ],
            });
        }
        // 5. Seed FAQ
        const faqCount = await prisma.fAQ.count();
        if (faqCount === 0) {
            await prisma.fAQ.createMany({
                data: [
                    { question: 'How does the QR tracking system work?', answer: 'Each garment receives a unique waterproof QR label during pickup. You can scan it to track progress live!', category: 'Garment Tracking', displayOrder: 1 },
                    { question: 'What is the standard turnaround time?', answer: 'Standard delivery takes 48-72 hours. We also offer 24-hour Express service for an extra charge.', category: 'Delivery', displayOrder: 2 },
                    { question: 'How can I pay for my order?', answer: 'We support online payments via SSLCommerz (Visa, Mastercard, bKash, Rocket) and payments using your local LAUNDRIX Wallet.', category: 'Payment', displayOrder: 3 },
                    { question: 'Is there a minimum order requirement?', answer: 'No, there is no minimum order size, but orders under 300 BDT incur a standard delivery charge.', category: 'Policy', displayOrder: 4 },
                ],
            });
        }
    }
    // Order Placement logic
    // Haversine formula: calculates the straight-line distance in km between two GPS coordinates
    static haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    // Finds the nearest active branch and auto-assigns an available local delivery agent
    static async routeOrderToBranch(customerLat, customerLon) {
        const branches = await prisma.branch.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, latitude: true, longitude: true },
        });
        if (!branches.length)
            return { branchId: null, agentId: null };
        let nearestBranchId = null;
        if (customerLat !== null && customerLon !== null) {
            // Pick the branch with the shortest Haversine distance
            let shortestDistance = Infinity;
            for (const branch of branches) {
                if (branch.latitude === null || branch.longitude === null)
                    continue;
                const dist = this.haversineDistance(customerLat, customerLon, branch.latitude, branch.longitude);
                if (dist < shortestDistance) {
                    shortestDistance = dist;
                    nearestBranchId = branch.id;
                }
            }
        }
        else {
            // No GPS data — fall back to the first active branch
            nearestBranchId = branches[0].id;
        }
        if (!nearestBranchId)
            return { branchId: null, agentId: null };
        return { branchId: nearestBranchId, agentId: null };
    }
}
exports.CustomerService = CustomerService;
_a = CustomerService;
// Get customer profile summary (wallet, loyalty, active orders count)
CustomerService.getProfileSummary = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    var _b, _c;
    const customer = await _a.getOrCreateCustomer(userId);
    const activeOrdersCount = await prisma.order.count({
        where: {
            customerId: customer.id,
            orderStatus: {
                in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PICKUP', 'WASHING', 'DELIVERY'],
            },
        },
    });
    const wishlistCount = await prisma.favoriteService.count({
        where: { customerId: customer.id },
    });
    return {
        customerId: customer.id,
        customerCode: customer.customerCode,
        fullName: customer.user.fullName,
        email: customer.user.email,
        phone: customer.user.phone,
        walletBalance: ((_b = customer.wallets[0]) === null || _b === void 0 ? void 0 : _b.balance) || 0.0,
        loyaltyPoints: ((_c = customer.loyaltyPointRecord) === null || _c === void 0 ? void 0 : _c.availablePoints) || 0,
        activeOrdersCount,
        wishlistCount,
    };
});
// Get all services with categories & addons
CustomerService.getServices = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    await _a.seedDemoServicesIfEmpty();
    const services = await prisma.service.findMany({
        where: { status: 'ACTIVE' },
        include: {
            garmentType: {
                include: { category: true },
            },
            addons: {
                where: { status: 'ACTIVE' },
            },
        },
    });
    let wishlistServiceIds = [];
    if (userId) {
        const customer = await _a.getOrCreateCustomer(userId);
        const wishlist = await prisma.favoriteService.findMany({
            where: { customerId: customer.id },
            select: { serviceId: true },
        });
        wishlistServiceIds = wishlist.map((w) => w.serviceId);
    }
    // Format services grouped by garment category
    return services.map((s) => {
        var _b, _c, _d;
        return ({
            id: s.id,
            serviceName: s.serviceName,
            description: s.description,
            basePrice: s.basePrice,
            garmentType: ((_b = s.garmentType) === null || _b === void 0 ? void 0 : _b.name) || 'General',
            category: ((_d = (_c = s.garmentType) === null || _c === void 0 ? void 0 : _c.category) === null || _d === void 0 ? void 0 : _d.name) || 'Clothing',
            estimatedTime: s.estimatedTime || '48 Hours',
            addons: s.addons.map((a) => ({
                id: a.id,
                addonName: a.addonName,
                price: a.price,
                description: a.description,
            })),
            isWishlisted: wishlistServiceIds.includes(s.id),
        });
    });
});
// Wishlist Logic
CustomerService.addToWishlist = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, serviceId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    const existing = await prisma.favoriteService.findFirst({
        where: { customerId: customer.id, serviceId },
    });
    if (existing) {
        return { message: 'Service already in wishlist' };
    }
    await prisma.favoriteService.create({
        data: { customerId: customer.id, serviceId },
    });
    return { message: 'Added to wishlist successfully' };
});
CustomerService.removeFromWishlist = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, serviceId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    await prisma.favoriteService.deleteMany({
        where: { customerId: customer.id, serviceId },
    });
    return { message: 'Removed from wishlist successfully' };
});
CustomerService.getWishlist = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    const favorites = await prisma.favoriteService.findMany({
        where: { customerId: customer.id },
    });
    const serviceIds = favorites.map((f) => f.serviceId);
    const services = await prisma.service.findMany({
        where: { id: { in: serviceIds }, status: 'ACTIVE' },
        include: {
            garmentType: { include: { category: true } },
            addons: true,
        },
    });
    return services.map((s) => {
        var _b, _c, _d;
        return ({
            id: s.id,
            serviceName: s.serviceName,
            basePrice: s.basePrice,
            garmentType: ((_b = s.garmentType) === null || _b === void 0 ? void 0 : _b.name) || 'General',
            category: ((_d = (_c = s.garmentType) === null || _c === void 0 ? void 0 : _c.category) === null || _d === void 0 ? void 0 : _d.name) || 'Clothing',
            addons: s.addons.map((a) => ({ id: a.id, name: a.addonName, price: a.price })),
        });
    });
});
// Support Tickets
CustomerService.createTicket = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, data) => {
    var _b;
    const customer = await _a.getOrCreateCustomer(userId);
    let category = await prisma.ticketCategory.findFirst({ where: { status: 'ACTIVE' } });
    if (!category) {
        category = await prisma.ticketCategory.create({
            data: { name: 'Support', description: 'General customer support' },
        });
    }
    const ticketNumber = `TCK-${Date.now()}`;
    const ticket = await prisma.supportTicket.create({
        data: {
            ticketNumber,
            customerId: customer.id,
            categoryId: category.id,
            subject: data.subject,
            priority: ((_b = data.priority) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'NORMAL',
            status: 'OPEN',
            messages: {
                create: {
                    senderId: userId,
                    message: data.message,
                },
            },
        },
    });
    return ticket;
});
CustomerService.getTickets = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    return prisma.supportTicket.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        include: { category: true },
    });
});
CustomerService.getTicketDetails = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, ticketId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    const ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, customerId: customer.id },
        include: {
            category: true,
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    if (!ticket)
        throw new Error('Ticket not found');
    // Retrieve sender names for ticket message history
    const userIds = ticket.messages.map((m) => m.senderId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true, userType: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    const messages = ticket.messages.map((m) => {
        const sender = userMap.get(m.senderId);
        return {
            id: m.id,
            message: m.message,
            createdAt: m.createdAt,
            senderId: m.senderId,
            senderName: (sender === null || sender === void 0 ? void 0 : sender.fullName) || 'User',
            senderType: (sender === null || sender === void 0 ? void 0 : sender.userType) || 'CUSTOMER',
        };
    });
    return Object.assign(Object.assign({}, ticket), { messages });
});
CustomerService.replyToTicket = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, ticketId, message) => {
    const customer = await _a.getOrCreateCustomer(userId);
    const ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, customerId: customer.id },
    });
    if (!ticket)
        throw new Error('Ticket not found');
    const newMessage = await prisma.ticketMessage.create({
        data: {
            ticketId: ticket.id,
            senderId: userId,
            message,
        },
    });
    // Update ticket updatedAt timestamp
    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
    });
    return newMessage;
});
// FAQs
CustomerService.getFAQs = (0, catchServiceAsync_1.catchServiceAsync)(async () => {
    return prisma.fAQ.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { displayOrder: 'asc' },
    });
});
// Wallet and Transactions
CustomerService.getTransactions = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    const wallet = customer.wallets[0];
    if (!wallet)
        return [];
    return prisma.customerTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
    });
});
CustomerService.placeOrder = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, orderData) => {
    var _b, _c, _d, _e;
    const customer = await _a.getOrCreateCustomer(userId);
    // 1. Calculate order prices
    let subtotal = 0.0;
    const orderItemsToCreate = [];
    for (const item of orderData.items) {
        const service = await prisma.service.findUnique({
            where: { id: item.serviceId },
            include: { addons: true },
        });
        if (!service)
            throw new Error(`Laundry service not found: ${item.serviceId}`);
        let itemPrice = service.basePrice;
        // Add pricing for selected addons
        const activeAddons = service.addons.filter((a) => { var _b; return (_b = item.addons) === null || _b === void 0 ? void 0 : _b.includes(a.id); });
        const addonCost = activeAddons.reduce((sum, a) => sum + a.price, 0.0);
        itemPrice += addonCost;
        const totalItemPrice = itemPrice * item.quantity;
        subtotal += totalItemPrice;
        orderItemsToCreate.push({
            serviceId: service.id,
            garmentTypeId: service.garmentTypeId,
            quantity: item.quantity,
            unitPrice: itemPrice,
            totalPrice: totalItemPrice,
        });
    }
    const deliveryCharge = subtotal > 300 ? 0.0 : 50.0;
    const discount = 0.0; // Promo coupons can be added later
    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% VAT
    const grandTotal = subtotal + deliveryCharge + tax - discount;
    // 2. Check wallet balance if payment method is WALLET
    if (orderData.paymentMethod === 'WALLET') {
        const wallet = customer.wallets[0];
        if (!wallet || wallet.balance < grandTotal) {
            throw new Error('Insufficient wallet balance');
        }
    }
    // TODO: Implement actual address selection instead of generating dummy addresses
    let address = await prisma.customerAddress.findFirst({
        where: { customerId: customer.id },
    });
    if (!address) {
        address = await prisma.customerAddress.create({
            data: {
                customerId: customer.id,
                receiverName: orderData.receiverName || customer.user.fullName,
                receiverPhone: orderData.receiverPhone || customer.user.phone || '000000',
                fullAddress: orderData.pickupAddress,
                city: 'Dhaka',
            },
        });
    }
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}`;
    // Date parsing
    const estimatedPickupTime = new Date(`${orderData.pickupDate}T${orderData.pickupTimeSlot.split(' - ')[0]}:00`);
    // Route order to the nearest active branch and find a local delivery agent
    const customerLat = (_c = (_b = orderData.latitude) !== null && _b !== void 0 ? _b : address.latitude) !== null && _c !== void 0 ? _c : null;
    const customerLon = (_e = (_d = orderData.longitude) !== null && _d !== void 0 ? _d : address.longitude) !== null && _e !== void 0 ? _e : null;
    const { branchId, agentId } = await _a.routeOrderToBranch(customerLat, customerLon);
    // 3. Create the Order inside transaction
    const result = await prisma.$transaction(async (tx) => {
        var _b;
        const order = await tx.order.create({
            data: {
                orderNumber,
                customerId: customer.id,
                branchId: branchId !== null && branchId !== void 0 ? branchId : undefined, // Auto-assigned nearest branch
                pickupAgentId: agentId !== null && agentId !== void 0 ? agentId : undefined, // Auto-assigned local pickup agent
                deliveryAgentId: agentId !== null && agentId !== void 0 ? agentId : undefined, // Pre-assign same agent for now
                pickupAddressId: address.id,
                deliveryAddressId: address.id,
                orderType: 'STANDARD',
                orderSource: 'CUSTOMER_PORTAL',
                totalGarments: orderData.items.reduce((sum, i) => sum + i.quantity, 0),
                subtotal,
                deliveryCharge,
                tax,
                grandTotal,
                orderStatus: 'PENDING',
                paymentStatus: orderData.paymentMethod === 'WALLET' ? 'PAID' : 'UNPAID',
                estimatedPickupTime,
                items: {
                    create: orderItemsToCreate,
                },
                timelines: {
                    create: {
                        status: 'PENDING',
                        description: 'Your laundry order has been submitted successfully.',
                    },
                },
            },
            include: {
                items: {
                    include: { garmentType: true }
                }
            }
        });
        // Auto-create garment items and QR codes per piece
        for (const oi of order.items) {
            for (let i = 0; i < oi.quantity; i++) {
                const garmentCode = `G-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                const garmentItem = await tx.garmentItem.create({
                    data: {
                        orderItemId: oi.id,
                        garmentCode,
                        garmentName: ((_b = oi.garmentType) === null || _b === void 0 ? void 0 : _b.name) || 'Garment Item',
                        status: 'PENDING'
                    }
                });
                const qrCode = `LAVO-${garmentItem.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
                await tx.garmentQRCode.create({
                    data: {
                        garmentItemId: garmentItem.id,
                        qrCode,
                        status: 'ACTIVE'
                    }
                });
            }
        }
        // Auto-create an unassigned PICKUP delivery record linked to the nearest branch
        // This will be broadcast to all delivery agents in that branch
        if (branchId) {
            const deliveryNumber = `DEL-${Date.now().toString().slice(-6)}-${orderNumber.slice(-4)}`;
            await tx.delivery.create({
                data: {
                    orderId: order.id,
                    customerId: customer.id,
                    branchId,
                    deliveryNumber,
                    deliveryType: 'PICKUP',
                    deliveryStatus: 'PENDING',
                    assignedAgentId: agentId !== null && agentId !== void 0 ? agentId : undefined,
                    deliveryAddressId: address.id,
                    scheduledDate: estimatedPickupTime,
                },
            });
        }
        // Deduct from wallet if method is WALLET
        if (orderData.paymentMethod === 'WALLET') {
            const wallet = customer.wallets[0];
            await tx.customerWallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: grandTotal },
                    lastTransactionAt: new Date(),
                },
            });
            await tx.customer.update({
                where: { id: customer.id },
                data: {
                    walletBalance: { decrement: grandTotal },
                },
            });
            // Log transaction
            await tx.customerTransaction.create({
                data: {
                    walletId: wallet.id,
                    transactionType: 'PAYMENT',
                    amount: grandTotal,
                    referenceType: 'ORDER',
                    referenceId: order.id,
                    paymentMethod: 'WALLET',
                    status: 'COMPLETED',
                },
            });
            // Add loyalty points (1 point per 100 BDT spent)
            const pointsEarned = Math.floor(grandTotal / 100);
            if (pointsEarned > 0) {
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { loyaltyPoints: { increment: pointsEarned } },
                });
                await tx.customerLoyaltyPoint.update({
                    where: { customerId: customer.id },
                    data: {
                        earnedPoints: { increment: pointsEarned },
                        availablePoints: { increment: pointsEarned },
                    },
                });
            }
        }
        return order;
    }, {
        maxWait: 5000,
        timeout: 20000,
    });
    return result;
});
// Fetch customer orders list
CustomerService.getOrders = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    return prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: { service: true },
            },
        },
    });
});
// Get single order details with timelines
CustomerService.getOrderDetails = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, orderId) => {
    const customer = await _a.getOrCreateCustomer(userId);
    const order = await prisma.order.findFirst({
        where: { id: orderId, customerId: customer.id },
        include: {
            items: {
                include: {
                    service: {
                        include: { garmentType: true },
                    },
                },
            },
            timelines: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    if (!order)
        throw new Error('Order not found');
    return order;
});
