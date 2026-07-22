import { Request, Response } from "express";
import { AdminSupportService } from "../services/adminSupportService";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

export class AdminSupportController {
  static getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const list = await AdminSupportService.getAllReviews();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reviews retrieved successfully",
      data: list,
    });
  });

  static replyToReview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string; // reviewId
    const { reply } = req.body;
    const result = await AdminSupportService.replyToReview(id, reply, (req as any).user?.id);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Admin reply added successfully",
      data: result,
    });
  });

  static getAllAnnouncements = catchAsync(async (req: Request, res: Response) => {
    const list = await AdminSupportService.getAllAnnouncements();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Announcements retrieved successfully",
      data: list,
    });
  });

  static createAnnouncement = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminSupportService.createAnnouncement(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Announcement created successfully",
      data: result,
    });
  });
}
