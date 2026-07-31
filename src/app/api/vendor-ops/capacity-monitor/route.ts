import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "VND-201",
      vendorName: "Apex Cleaners Ltd.",
      serviceFocus: "Leather & Delicate Care",
      dailyCapacityKg: 500,
      activeLoadKg: 380,
      assignedOrders: 19,
      loadPercentage: 76,
      rating: 4.8,
      status: "OPTIMAL",
    },
    {
      id: "VND-202",
      vendorName: "Royal Wash & Press Co.",
      serviceFocus: "Curtains & Carpet Washing",
      dailyCapacityKg: 800,
      activeLoadKg: 740,
      assignedOrders: 27,
      loadPercentage: 92,
      rating: 4.6,
      status: "HIGH_CAPACITY",
    },
    {
      id: "VND-203",
      vendorName: "SilkCare Specialty Laundry",
      serviceFocus: "Saree & Silk Dry Clean",
      dailyCapacityKg: 300,
      activeLoadKg: 110,
      assignedOrders: 8,
      loadPercentage: 36,
      rating: 4.9,
      status: "AVAILABLE",
    },
    {
      id: "VND-204",
      vendorName: "Urban Garment Care",
      serviceFocus: "Suit & Blazer Restorations",
      dailyCapacityKg: 400,
      activeLoadKg: 395,
      assignedOrders: 22,
      loadPercentage: 99,
      rating: 4.7,
      status: "FULL",
    },
  ];

  return NextResponse.json({ success: true, data });
}
