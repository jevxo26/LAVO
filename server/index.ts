import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import next from "next";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import path from "path";
import authRoutes from "./routes/auth/authRoutes";
import userRoutes from "./routes/shared/userRoutes";
import uploadRoutes from "./routes/shared/uploadRoutes";
import branchRoutes from "./routes/super-admin/branchRoutes";
import settingRoutes from "./routes/shared/settingRoutes";
import vendorRoutes from "./routes/super-admin/vendorRoutes";
import serviceRoutes from "./routes/shared/serviceRoutes";
import logisticsRoutes from "./routes/agent/logisticsRoutes";
import supportRoutes from "./routes/customer/supportRoutes";
import financeRoutes from "./routes/super-admin/financeRoutes";
import branchDashboardRoutes from "./routes/branch-manager/branchDashboardRoutes";
import deliveryAgentRoutes from "./routes/agent/deliveryAgentRoutes"
import customerRoutes from "./routes/customer/customerRoutes";
import employeeRoutes from "./routes/employee/employeeRoutes";
import paymentRoutes from "./routes/customer/paymentRoutes";
import chatRoutes from "./routes/customer/chatRoutes";
import cmsRoutes from "./routes/super-admin/cmsRoutes";
import ticketRoutes from "./routes/customer/ticketRoutes";
import roleRoutes from "./routes/super-admin/roleRoutes";
import featureFlagRoutes from "./routes/shared/featureFlagRoutes";
import auditLogRoutes from "./routes/admin/auditLogRoutes";
import analyticsRoutes from "./routes/admin/analyticsRoutes";
import adminVendorRoutes from "./routes/admin/adminVendorRoutes";
import adminSupportRoutes from "./routes/admin/adminSupportRoutes";
import vendorDashboardRoutes from "./routes/vendor/vendorDashboardRoutes";
import adminUserRoutes from "./routes/admin/adminUserRoutes";
import adminPermissionRoutes from "./routes/admin/adminPermissionRoutes";
import adminOverviewRoutes from "./routes/admin/adminOverviewRoutes";
import { auditLogger } from "./middlewares/auditMiddleware";
import partnerApplicationRoutes from "./routes/super-admin/partnerApplicationRoute";
import notificationRoutes from "./routes/shared/notificationRoutes";
import profileRoutes from "./routes/shared/profileRoutes";
import agentOpsRoutes from "./routes/admin/agentOpsRoutes";
import { initSocket } from "./sockets/socket";
import { validateEnvironmentVariables } from "./config/envValidation";
import prisma from "./config/prisma";
import { authRateLimiter, paymentRateLimiter, apiRateLimiter } from "./middlewares/rateLimiter";
import compression from "compression";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: process.cwd() });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  validateEnvironmentVariables();
  const server = express();

  // Gzip/Brotli payload compression for maximum response speed
  server.use(compression());

  // Middleware
  // Restrict CORS to known frontend origins only
  const allowedOrigins = [
    'http://localhost:3000',
    'https://lavo-psi.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  server.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile/curl/server-to-server), 'null' origin (browser form POSTs), SSLCommerz, or listed origins
      if (!origin || origin === 'null' || allowedOrigins.includes(origin) || origin.includes('sslcommerz.com') || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error: Origin ${origin} is not allowed by CORS policy`), false);
      }
    },
    credentials: true,
  }));

  server.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
          imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://*.leafletjs.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "ws:", "wss:", "https://sandbox.sslcommerz.com", "https://securepay.sslcommerz.com"],
        },
      } : false,
      crossOriginEmbedderPolicy: false,
      xFrameOptions: { action: "sameorigin" },
    })
  );
  server.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', {
    skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico')
  }));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser());

  // Database Connection using Prisma
  try {
    await prisma.$connect();
    console.log('Prisma connected to the database successfully!');
  } catch (err) {
    console.error('Error connecting to the database with Prisma:', err);
  }

  // API Routes
  server.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // Public: published customer reviews used as homepage testimonials (no auth required)
  server.get('/api/public/reviews', async (req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200');
      const { getPublishedReviews } = await import('./services/customer/reviewService');
      const limit = Math.min(Number(req.query.limit) || 8, 20);
      const data  = await getPublishedReviews(limit);
      res.json({ success: true, data });
    } catch (err) {
      console.error('[public/reviews]', err);
      res.status(500).json({ success: false, data: [] });
    }
  });

  server.use('/api', apiRateLimiter);
  server.use(auditLogger);
  server.use('/api/users', userRoutes);
  server.use('/api/auth', authRateLimiter, authRoutes);
  server.use('/api/upload', uploadRoutes);
  server.use('/api/branches', branchRoutes);
  server.use('/api/settings', settingRoutes);
  server.use('/api/vendors', vendorRoutes);
  server.use('/api/services', serviceRoutes);
  server.use('/api/logistics', logisticsRoutes);
  server.use('/api/support', supportRoutes);
  server.use('/api/finance', financeRoutes);
  server.use('/api/branch-dashboard', branchDashboardRoutes);
  server.use('/api/delivery-agent', deliveryAgentRoutes);
  server.use('/api/customer', customerRoutes);
  server.use('/api/employee', employeeRoutes);
  server.use('/api/employee-dashboard', employeeRoutes);
  server.use('/api/payments', paymentRateLimiter, paymentRoutes);
  server.use('/api/chat', chatRoutes);
  server.use('/api/cms', cmsRoutes);
  server.use('/api/tickets', ticketRoutes);
  server.use('/api/roles', roleRoutes);
  server.use('/api/feature-flags', featureFlagRoutes);
  server.use('/api/audit-logs', auditLogRoutes);
  server.use('/api/analytics', analyticsRoutes);
  server.use('/api/admin/vendors', adminVendorRoutes);
  server.use('/api/admin/support', adminSupportRoutes);
  server.use('/api/admin/users', adminUserRoutes);
  server.use('/api/admin/permissions', adminPermissionRoutes);
  server.use('/api/admin/overview', adminOverviewRoutes);
  server.use('/api/vendor-dashboard', vendorDashboardRoutes);
  server.use('/api/partner-applications', partnerApplicationRoutes);
  server.use('/api/notifications', notificationRoutes);
  server.use('/api/profile', profileRoutes);
  server.use('/api/agent-ops', agentOpsRoutes);
  // Serve uploaded files statically
  server.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Let Next.js handle all other routes
  server.use((req: Request, res: Response) => {
    return handle(req, res);
  });

  // Global Error Handler
  server.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    if (err.message === 'User already exists with this email') statusCode = 409;
    if (err.message === 'User already exists with this phone number') statusCode = 409;
    if (err.message === 'Agent already exists with this phone number') statusCode = 409;
    if (err.message === 'Vehicle already exists with this number') statusCode = 409;
    if (err.message === 'Invalid email or password') statusCode = 401;
    if (err.message === 'Unauthorized') statusCode = 401;

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
  initSocket(httpServer);

}).catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});
