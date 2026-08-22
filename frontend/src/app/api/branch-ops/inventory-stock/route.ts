import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "INV-501",
      itemName: "Eco-Grade Liquid Detergent (20L)",
      category: "CHEMICALS",
      branchName: "Central Hub - Sector 4",
      stockQuantity: 48,
      minThreshold: 15,
      unit: "Canisters",
      status: "IN_STOCK",
    },
    {
      id: "INV-502",
      itemName: "Fabric Softener & Conditioner (10L)",
      category: "CHEMICALS",
      branchName: "Gulshan Processing Center",
      stockQuantity: 6,
      minThreshold: 10,
      unit: "Canisters",
      status: "LOW_STOCK",
    },
    {
      id: "INV-503",
      itemName: "Biodegradable Garment Covers",
      category: "PACKAGING",
      branchName: "Central Hub - Sector 4",
      stockQuantity: 3400,
      minThreshold: 1000,
      unit: "Units",
      status: "IN_STOCK",
    },
    {
      id: "INV-504",
      itemName: "Heavy-Duty Coat Hangers",
      category: "PACKAGING",
      branchName: "Dhanmondi Laundrix Hub",
      stockQuantity: 150,
      minThreshold: 500,
      unit: "Units",
      status: "CRITICAL_LOW",
    },
    {
      id: "INV-505",
      itemName: "Stain Remover Spotting Agent",
      category: "CHEMICALS",
      branchName: "Banani Express Wash",
      stockQuantity: 24,
      minThreshold: 8,
      unit: "Bottles",
      status: "IN_STOCK",
    },
  ];

  return NextResponse.json({ success: true, data });
}
