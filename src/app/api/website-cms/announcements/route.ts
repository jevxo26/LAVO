import { NextResponse } from "next/server";

export async function GET() {
  const announcements = [
    {
      id: "ANN-01",
      title: "Eid Special 20% Discount on Dry Cleaning",
      content: "Use code EID20 at checkout for all premium dry cleaning items.",
      bannerType: "PROMOTIONAL",
      isActive: true,
      startDate: "2026-07-20",
      endDate: "2026-08-10",
    },
    {
      id: "ANN-02",
      title: "Scheduled Server Maintenance on Aug 2",
      content: "App services will undergo routine maintenance from 2:00 AM to 4:00 AM.",
      bannerType: "SYSTEM_ALERT",
      isActive: true,
      startDate: "2026-08-01",
      endDate: "2026-08-03",
    },
  ];
  return NextResponse.json({ success: true, data: announcements });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, message: "Announcement published successfully", data: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
