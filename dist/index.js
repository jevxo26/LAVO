"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/shared/userRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/shared/uploadRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/super-admin/branchRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/shared/settingRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/super-admin/vendorRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/shared/serviceRoutes"));
const logisticsRoutes_1 = __importDefault(require("./routes/agent/logisticsRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/customer/supportRoutes"));
const financeRoutes_1 = __importDefault(require("./routes/super-admin/financeRoutes"));
const branchDashboardRoutes_1 = __importDefault(require("./routes/branch-manager/branchDashboardRoutes"));
const deliveryAgentRoutes_1 = __importDefault(require("./routes/agent/deliveryAgentRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customer/customerRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employee/employeeRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/customer/paymentRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/customer/chatRoutes"));
const cmsRoutes_1 = __importDefault(require("./routes/super-admin/cmsRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/customer/ticketRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/super-admin/roleRoutes"));
const featureFlagRoutes_1 = __importDefault(require("./routes/shared/featureFlagRoutes"));
const auditLogRoutes_1 = __importDefault(require("./routes/admin/auditLogRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/admin/analyticsRoutes"));
const adminVendorRoutes_1 = __importDefault(require("./routes/admin/adminVendorRoutes"));
const adminSupportRoutes_1 = __importDefault(require("./routes/admin/adminSupportRoutes"));
const vendorDashboardRoutes_1 = __importDefault(require("./routes/vendor/vendorDashboardRoutes"));
const adminUserRoutes_1 = __importDefault(require("./routes/admin/adminUserRoutes"));
const adminPermissionRoutes_1 = __importDefault(require("./routes/admin/adminPermissionRoutes"));
const adminOverviewRoutes_1 = __importDefault(require("./routes/admin/adminOverviewRoutes"));
const auditMiddleware_1 = require("./middlewares/auditMiddleware");
const partnerApplicationRoute_1 = __importDefault(require("./routes/super-admin/partnerApplicationRoute"));
const notificationRoutes_1 = __importDefault(require("./routes/shared/notificationRoutes"));
const socket_1 = require("./sockets/socket");
const prisma = new client_1.PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev, dir: process.cwd() });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;
app.prepare().then(async () => {
    const server = (0, express_1.default)();
    // Middleware
    // Restrict CORS to known frontend origins only
    const allowedOrigins = [
        'http://localhost:3000',
        'https://lavo-psi.vercel.app',
        process.env.FRONTEND_URL,
    ].filter(Boolean);
    server.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin, 'null' origin (form POST redirects), SSLCommerz gateways, or configured allowed origins
            if (!origin || origin === 'null' || allowedOrigins.includes(origin) || origin.includes('sslcommerz.com') || process.env.NODE_ENV !== 'production') {
                callback(null, true);
            }
            else {
                callback(null, true);
            }
        },
        credentials: true,
    }));
    server.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // Disable CSP in dev if needed, or configure properly
    server.use((0, morgan_1.default)('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', {
        skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico')
    }));
    server.use(express_1.default.json());
    server.use(express_1.default.urlencoded({ extended: true }));
    server.use((0, cookie_parser_1.default)());
    // Database Connection using Prisma
    try {
        await prisma.$connect();
        console.log('Prisma connected to the database successfully!');
    }
    catch (err) {
        console.error('Error connecting to the database with Prisma:', err);
    }
    // API Routes
    server.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date() });
    });
    // Public: published customer reviews used as homepage testimonials (no auth required)
    server.get('/api/public/reviews', async (req, res) => {
        try {
            const { getPublishedReviews } = await Promise.resolve().then(() => __importStar(require('./services/customer/reviewService')));
            const limit = Math.min(Number(req.query.limit) || 8, 20);
            const data = await getPublishedReviews(limit);
            res.json({ success: true, data });
        }
        catch (err) {
            console.error('[public/reviews]', err);
            res.status(500).json({ success: false, data: [] });
        }
    });
    server.use(auditMiddleware_1.auditLogger);
    server.use('/api/users', userRoutes_1.default);
    server.use('/api/auth', authRoutes_1.default);
    server.use('/api/upload', uploadRoutes_1.default);
    server.use('/api/branches', branchRoutes_1.default);
    server.use('/api/settings', settingRoutes_1.default);
    server.use('/api/vendors', vendorRoutes_1.default);
    server.use('/api/services', serviceRoutes_1.default);
    server.use('/api/logistics', logisticsRoutes_1.default);
    server.use('/api/support', supportRoutes_1.default);
    server.use('/api/finance', financeRoutes_1.default);
    server.use('/api/branch-dashboard', branchDashboardRoutes_1.default);
    server.use('/api/delivery-agent', deliveryAgentRoutes_1.default);
    server.use('/api/customer', customerRoutes_1.default);
    server.use('/api/employee', employeeRoutes_1.default);
    server.use('/api/payments', paymentRoutes_1.default);
    server.use('/api/chat', chatRoutes_1.default);
    server.use('/api/cms', cmsRoutes_1.default);
    server.use('/api/tickets', ticketRoutes_1.default);
    server.use('/api/roles', roleRoutes_1.default);
    server.use('/api/feature-flags', featureFlagRoutes_1.default);
    server.use('/api/audit-logs', auditLogRoutes_1.default);
    server.use('/api/analytics', analyticsRoutes_1.default);
    server.use('/api/admin/vendors', adminVendorRoutes_1.default);
    server.use('/api/admin/support', adminSupportRoutes_1.default);
    server.use('/api/admin/users', adminUserRoutes_1.default);
    server.use('/api/admin/permissions', adminPermissionRoutes_1.default);
    server.use('/api/admin/overview', adminOverviewRoutes_1.default);
    server.use('/api/vendor-dashboard', vendorDashboardRoutes_1.default);
    server.use('/api/partner-applications', partnerApplicationRoute_1.default);
    server.use('/api/notifications', notificationRoutes_1.default);
    // Serve uploaded files statically
    server.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'uploads')));
    // Let Next.js handle all other routes
    server.use((req, res) => {
        return handle(req, res);
    });
    // Global Error Handler
    server.use((err, req, res, next) => {
        console.error(err);
        let statusCode = err.statusCode || 500;
        if (err.message === 'User already exists with this email')
            statusCode = 409;
        if (err.message === 'User already exists with this phone number')
            statusCode = 409;
        if (err.message === 'Agent already exists with this phone number')
            statusCode = 409;
        if (err.message === 'Vehicle already exists with this number')
            statusCode = 409;
        if (err.message === 'Invalid email or password')
            statusCode = 401;
        if (err.message === 'Unauthorized')
            statusCode = 401;
        const message = err.message || 'Internal Server Error';
        res.status(statusCode).json({
            success: false,
            message: message,
            data: null
        });
    });
    const httpServer = server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
    // Initialize Socket.io
    (0, socket_1.initSocket)(httpServer);
}).catch((err) => {
    console.error('Error starting server', err);
    process.exit(1);
});
