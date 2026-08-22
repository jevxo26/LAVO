import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "VPS-701",
      vendorName: "Apex Cleaners Ltd.",
      batchId: "BATCH-8821",
      itemType: "Leather Jackets & Coats",
      quantity: 14,
      stage: "SOLVENT_SOAKING",
      progressPercentage: 45,
      estimatedCompletion: "2 Hours",
      status: "IN_PROGRESS",
    },
    {
      id: "VPS-702",
      vendorName: "Royal Wash & Press Co.",
      batchId: "BATCH-8822",
      itemType: "Heavy Velvet Curtains",
      quantity: 8,
      stage: "FINAL_INSPECTION",
      progressPercentage: 90,
      estimatedCompletion: "20 Mins",
      status: "NEAR_COMPLETION",
    },
    {
      id: "VPS-703",
      vendorName: "SilkCare Specialty Laundry",
      batchId: "BATCH-8823",
      itemType: "Embroidery Sarees",
      quantity: 22,
      stage: "STEAM_PRESSING",
      progressPercentage: 70,
      estimatedCompletion: "45 Mins",
      status: "IN_PROGRESS",
    },
    {
      id: "VPS-704",
      vendorName: "Urban Garment Care",
      batchId: "BATCH-8824",
      itemType: "Woolen Suits",
      quantity: 18,
      stage: "QUALITY_CHECK_FAILED",
      progressPercentage: 60,
      estimatedCompletion: "Delayed - Re-clean",
      status: "ATTENTION_REQUIRED",
    },
  ];

  return NextResponse.json({ success: true, data });
}
