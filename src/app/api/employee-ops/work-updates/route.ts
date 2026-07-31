import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "WUP-101",
      employeeName: "Abul Kalam",
      branchName: "Central Hub - Sector 4",
      shift: "Morning (8 AM - 4 PM)",
      garmentsScanned: 142,
      qualityPasses: 140,
      reworkRequired: 2,
      timestamp: "10 Mins ago",
      status: "ACTIVE",
    },
    {
      id: "WUP-102",
      employeeName: "Nasrin Sultana",
      branchName: "Gulshan Processing Center",
      shift: "Morning (8 AM - 4 PM)",
      garmentsScanned: 98,
      qualityPasses: 98,
      reworkRequired: 0,
      timestamp: "25 Mins ago",
      status: "ACTIVE",
    },
    {
      id: "WUP-103",
      employeeName: "Tariqul Islam",
      branchName: "Dhanmondi Laundrix Hub",
      shift: "Evening (4 PM - 12 AM)",
      garmentsScanned: 0,
      qualityPasses: 0,
      reworkRequired: 0,
      timestamp: "Scheduled 4:00 PM",
      status: "UPCOMING_SHIFT",
    },
  ];

  return NextResponse.json({ success: true, data });
}
