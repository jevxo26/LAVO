"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminVendorController = void 0;
const adminVendorService_1 = require("../services/adminVendorService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class AdminVendorController {
}
exports.AdminVendorController = AdminVendorController;
_a = AdminVendorController;
AdminVendorController.getPendingVerifications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const list = await adminVendorService_1.AdminVendorService.getPendingVerifications();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Pending verifications retrieved successfully",
        data: list,
    });
});
AdminVendorController.verifyVendor = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { isApproved, remarks } = req.body;
    const result = await adminVendorService_1.AdminVendorService.verifyVendor(id, isApproved, remarks);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `Vendor verification processed: ${isApproved ? "Approved" : "Rejected"}`,
        data: result,
    });
});
AdminVendorController.getPayoutRequests = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payouts = await adminVendorService_1.AdminVendorService.getPayoutRequests();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Payout requests retrieved successfully",
        data: payouts,
    });
});
AdminVendorController.processPayout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body; // PAID or REJECTED
    const result = await adminVendorService_1.AdminVendorService.processPayout(id, status);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `Payout request processed: ${status}`,
        data: result,
    });
});
