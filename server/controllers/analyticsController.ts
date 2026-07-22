import { Request, Response } from "express";
import { AnalyticsService } from "../services/analyticsService";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";

export class AnalyticsController {
  static getOverviewStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await AnalyticsService.getOverviewStats();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Overview stats retrieved successfully",
      data: stats,
    });
  });

  static getChartData = catchAsync(async (req: Request, res: Response) => {
    const chartData = await AnalyticsService.getChartData();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Chart data retrieved successfully",
      data: chartData,
    });
  });

  static exportReport = catchAsync(async (req: Request, res: Response) => {
    const data = await AnalyticsService.getChartData();
    
    // Generate CSV content
    let csv = "Date,Total Orders,Gross Revenue ($),Net Commission ($)\n";
    data.forEach((row) => {
      csv += `${row.date},${row.orders},${row.revenue},${row.netCommission}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("laundrix-executive-report.csv");
    res.status(200).send(csv);
  });
}
