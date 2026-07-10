"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/branchRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const logisticsRoutes_1 = __importDefault(require("./routes/logisticsRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const financeRoutes_1 = __importDefault(require("./routes/financeRoutes"));
const prisma = new client_1.PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;
app.prepare().then(async () => {
    const server = (0, express_1.default)();
    // Middleware
    server.use((0, cors_1.default)());
    server.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // Disable CSP in dev if needed, or configure properly
    server.use((0, morgan_1.default)('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', {
        skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico')
    }));
    server.use(express_1.default.json());
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
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Error starting server', err);
    process.exit(1);
});
