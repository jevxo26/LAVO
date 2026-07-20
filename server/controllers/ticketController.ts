import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { TicketService } from '../services/ticketService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { getIO } from '../socket';

export class TicketController {
  // Create a new ticket
  static createTicket = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      return sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await TicketService.createTicket(userId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Ticket created successfully',
      data: result,
    });
  });

  // Get tickets list based on role
  static getTickets = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId || !role) {
      return sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await TicketService.getTickets(userId, role);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  });

  // Get active staff assignees
  static getAssignableUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await TicketService.getAssignableUsers();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  });

  // Get ticket details and messages
  static getTicketDetails = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const id = req.params.id as string;
    if (!userId || !role) {
      return sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await TicketService.getTicketDetails(id, userId, role);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  });

  // Update ticket status
  static updateTicketStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const id = req.params.id as string;
    const { status } = req.body;
    if (!userId || !role) {
      return sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await TicketService.updateTicketStatus(id, userId, role, status);
    try {
      getIO().to(`ticket_${id}`).emit('ticketStatusUpdated', { ticketId: id, status });
    } catch (err) {
      console.error('Socket broadcast failed:', err);
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Ticket status updated successfully',
      data: result,
    });
  });

  // Add message
  static addMessage = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const id = req.params.id as string;
    const { content } = req.body;
    if (!userId || !role) {
      return sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await TicketService.addMessage(id, userId, role, content);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Message sent successfully',
      data: result,
    });
  });
}
