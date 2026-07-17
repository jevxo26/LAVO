import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import next from 'next';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import branchRoutes from './routes/branchRoutes';
import settingRoutes from './routes/settingRoutes';
import vendorRoutes from './routes/vendorRoutes';
import serviceRoutes from './routes/serviceRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import supportRoutes from './routes/supportRoutes';
import financeRoutes from './routes/financeRoutes';
import branchDashboardRoutes from './routes/branchDashboardRoutes';
import deliveryAgentRoutes from './routes/deliveryAgentRoutes'
import customerRoutes from './routes/customerRoutes';
import paymentRoutes from './routes/paymentRoutes';

import { initSocket } from './socket';

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  const server = express();

  // Middleware
  // Restrict CORS to known frontend origins only
  const allowedOrigins = [
    'http://localhost:3000',
    'https://lavo-psi.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  server.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }));
  server.use(helmet({ contentSecurityPolicy: false })); // Disable CSP in dev if needed, or configure properly
  server.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', {
    skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico')
  }));
  server.use(express.json());
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

  server.use('/api/users', userRoutes);
  server.use('/api/auth', authRoutes);
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
  server.use('/api/payments', paymentRoutes);


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
