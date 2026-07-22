import { Request, Response } from "express";
import { AuditLogService } from "../services/auditLogService";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

export class AuditLogController {
  static getAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    const result = await AuditLogService.getAllAuditLogs(page, limit, search);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Audit logs retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  });

  static createAuditLog = catchAsync(async (req: Request, res: Response) => {
    const log = await AuditLogService.createAuditLog({
      ...req.body,
      ipAddress: req.ip,
    });
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Audit log created successfully",
      data: log,
    });
  });
}
