import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "TSK-801",
      title: "Sort Express Order Batch #9021",
      assignedTo: "Abul Kalam",
      branchName: "Central Hub - Sector 4",
      priority: "HIGH",
      dueDate: "Today, 2:00 PM",
      status: "IN_PROGRESS",
    },
    {
      id: "TSK-802",
      title: "Chemical Refill - Washer Unit A1",
      assignedTo: "Nasrin Sultana",
      branchName: "Gulshan Processing Center",
      priority: "MEDIUM",
      dueDate: "Today, 3:30 PM",
      status: "PENDING",
    },
    {
      id: "TSK-803",
      title: "Tagging & Barcode Audit",
      assignedTo: "Tariqul Islam",
      branchName: "Dhanmondi Laundrix Hub",
      priority: "LOW",
      dueDate: "Tomorrow, 10:00 AM",
      status: "COMPLETED",
    },
  ];

  return NextResponse.json({ success: true, data });
}
