import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "PAY-1001",
      vendorName: "SilkCare Specialty Laundry",
      bankName: "City Bank PLC",
      accountNumber: "**** **** 8821",
      requestedAmount: 5456.0,
      commissionDeducted: 744.0,
      grossAmount: 6200.0,
      requestedAt: "2026-07-30",
      status: "PENDING_APPROVAL",
    },
    {
      id: "PAY-1002",
      vendorName: "Urban Garment Care",
      bankName: "BRAC Bank PLC",
      accountNumber: "**** **** 3349",
      requestedAmount: 8330.0,
      commissionDeducted: 1470.0,
      grossAmount: 9800.0,
      requestedAt: "2026-07-29",
      status: "PENDING_APPROVAL",
    },
    {
      id: "PAY-1003",
      vendorName: "Apex Cleaners Ltd.",
      bankName: "Dutch-Bangla Bank PLC",
      accountNumber: "**** **** 1029",
      requestedAmount: 10582.5,
      commissionDeducted: 1867.5,
      grossAmount: 12450.0,
      requestedAt: "2026-07-25",
      status: "APPROVED",
    },
  ];

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payoutId, action } = body;
    return NextResponse.json({
      success: true,
      message: `Payout ${payoutId} has been successfully ${action.toLowerCase()}ed.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
