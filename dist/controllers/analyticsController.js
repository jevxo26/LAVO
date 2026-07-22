"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class AnalyticsController {
}
exports.AnalyticsController = AnalyticsController;
_a = AnalyticsController;
AnalyticsController.getOverviewStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await analyticsService_1.AnalyticsService.getOverviewStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Overview stats retrieved successfully",
        data: stats,
    });
});
AnalyticsController.getChartData = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const chartData = await analyticsService_1.AnalyticsService.getChartData();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Chart data retrieved successfully",
        data: chartData,
    });
});
AnalyticsController.exportReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await analyticsService_1.AnalyticsService.getChartData();
    // Generate CSV content
    let csv = "Date,Total Orders,Gross Revenue ($),Net Commission ($)\n";
    data.forEach((row) => {
        csv += `${row.date},${row.orders},${row.revenue},${row.netCommission}\n`;
    });
    res.header("Content-Type", "text/csv");
    res.attachment("laundrix-executive-report.csv");
    res.status(200).send(csv);
});
