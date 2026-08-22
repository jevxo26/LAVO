import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "COM-401",
      vendorName: "Apex Cleaners Ltd.",
      monthYear: "July 2026",
      grossOrderVolume: 12450.0,
      platformFeeRate: "15%",
      commissionEarned: 1867.5,
      netPayoutToVendor: 10582.5,
      payoutStatus: "PAID",
      settledAt: "2026-07-28",
    },
    {
      id: "COM-402",
      vendorName: "Royal Wash & Press Co.",
      monthYear: "July 2026",
      grossOrderVolume: 18900.0,
      platformFeeRate: "15%",
      commissionEarned: 2835.0,
      netPayoutToVendor: 16065.0,
      payoutStatus: "PAID",
      settledAt: "2026-07-28",
    },
    {
      id: "COM-403",
      vendorName: "SilkCare Specialty Laundry",
      monthYear: "July 2026",
      grossOrderVolume: 6200.0,
      platformFeeRate: "12%",
      commissionEarned: 744.0,
      netPayoutToVendor: 5456.0,
      payoutStatus: "PENDING_APPROVAL",
      settledAt: "-",
    },
    {
      id: "COM-404",
      vendorName: "Urban Garment Care",
      monthYear: "July 2026",
      grossOrderVolume: 9800.0,
      platformFeeRate: "15%",
      commissionEarned: 1470.0,
      netPayoutToVendor: 8330.0,
      payoutStatus: "PROCESSING",
      settledAt: "-",
    },
  ];

  return NextResponse.json({ success: true, data });
}
