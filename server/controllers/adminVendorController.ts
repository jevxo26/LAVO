import { Request, Response } from "express";
import { AdminVendorService } from "../services/adminVendorService";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

export class AdminVendorController {
  static getPendingVerifications = catchAsync(async (req: Request, res: Response) => {
    const list = await AdminVendorService.getPendingVerifications();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Pending verifications retrieved successfully",
      data: list,
    });
  });

  static verifyVendor = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { isApproved, remarks } = req.body;
    const result = await AdminVendorService.verifyVendor(id, isApproved, remarks);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Vendor verification processed: ${isApproved ? "Approved" : "Rejected"}`,
      data: result,
    });
  });

  static getPayoutRequests = catchAsync(async (req: Request, res: Response) => {
    const payouts = await AdminVendorService.getPayoutRequests();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payout requests retrieved successfully",
      data: payouts,
    });
  });

  static processPayout = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body; // PAID or REJECTED
    const result = await AdminVendorService.processPayout(id, status);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Payout request processed: ${status}`,
      data: result,
    });
  });
}
