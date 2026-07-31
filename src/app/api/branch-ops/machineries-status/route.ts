import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "MCH-101",
      branchName: "Central Hub - Sector 4",
      machineName: "Industrial Washer Extractor A1",
      category: "WASHING",
      status: "RUNNING",
      temperature: "60°C",
      efficiency: "96%",
      lastMaintenance: "2026-07-15",
    },
    {
      id: "MCH-102",
      branchName: "Central Hub - Sector 4",
      machineName: "High-Capacity Tumble Dryer B2",
      category: "DRYING",
      status: "RUNNING",
      temperature: "75°C",
      efficiency: "92%",
      lastMaintenance: "2026-07-10",
    },
    {
      id: "MCH-103",
      branchName: "Gulshan Processing Center",
      machineName: "Automatic Steam Ironing Press C1",
      category: "IRONING",
      status: "MAINTENANCE",
      temperature: "25°C",
      efficiency: "0%",
      lastMaintenance: "2026-07-28",
    },
    {
      id: "MCH-104",
      branchName: "Dhanmondi Laundrix Hub",
      machineName: "Perchloroethylene Dry Cleaner D1",
      category: "DRY_CLEANING",
      status: "RUNNING",
      temperature: "45°C",
      efficiency: "98%",
      lastMaintenance: "2026-07-20",
    },
    {
      id: "MCH-105",
      branchName: "Banani Express Wash",
      machineName: "Ozone Sanitizing Chamber E1",
      category: "SANITIZATION",
      status: "IDLE",
      temperature: "30°C",
      efficiency: "100%",
      lastMaintenance: "2026-07-01",
    },
  ];

  return NextResponse.json({ success: true, data });
}
