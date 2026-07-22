"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const auditLogService_1 = require("../services/auditLogService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class AuditLogController {
}
exports.AuditLogController = AuditLogController;
_a = AuditLogController;
AuditLogController.getAllAuditLogs = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const result = await auditLogService_1.AuditLogService.getAllAuditLogs(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
AuditLogController.createAuditLog = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const log = await auditLogService_1.AuditLogService.createAuditLog(Object.assign(Object.assign({}, req.body), { ipAddress: req.ip }));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Audit log created successfully",
        data: log,
    });
});
