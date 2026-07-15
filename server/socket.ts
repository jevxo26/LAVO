import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://lavo-psi.vercel.app',
        process.env.FRONTEND_URL || ''
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('A client connected:', socket.id);

    // Join a specific branch room for dashboard updates
    socket.on('joinBranch', (branchId: string) => {
      socket.join(`branch_${branchId}`);
      console.log(`Socket ${socket.id} joined branch room: branch_${branchId}`);
    });

    // Handle employee QR scan updates
    socket.on('garmentScan', async (data: { qrCode: string, status: string, employeeId: string, branchId: string }) => {
      console.log('Received garment scan update:', data);
      
      // In production, you would save this to Prisma (ProcessingTimeline / ProcessingEmployee)
      // For now, emit the update back to the branch manager dashboard
      io.to(`branch_${data.branchId}`).emit('garmentStatusUpdated', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
