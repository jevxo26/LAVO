import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "VHL-301",
      vehicleNumber: "DHAKA-METRO-HA-5521",
      type: "ELECTRIC_VAN",
      assignedAgent: "Kamal Hossain",
      fuelOrBattery: "88%",
      odometerKm: 14250,
      maintenanceDueDate: "2026-08-15",
      status: "EXCELLENT",
    },
    {
      id: "VHL-302",
      vehicleNumber: "DHAKA-METRO-HA-6642",
      type: "CARGO_SCOOTER",
      assignedAgent: "Rafiqul Islam",
      fuelOrBattery: "64%",
      odometerKm: 8900,
      maintenanceDueDate: "2026-08-05",
      status: "GOOD",
    },
    {
      id: "VHL-303",
      vehicleNumber: "DHAKA-METRO-HA-7719",
      type: "ELECTRIC_VAN",
      assignedAgent: "Jahid Hasan",
      fuelOrBattery: "95%",
      odometerKm: 21300,
      maintenanceDueDate: "2026-07-30",
      status: "SERVICE_OVERDUE",
    },
    {
      id: "VHL-304",
      vehicleNumber: "DHAKA-METRO-HA-9011",
      type: "CARGO_SCOOTER",
      assignedAgent: "Mahbubur Rahman",
      fuelOrBattery: "42%",
      odometerKm: 5400,
      maintenanceDueDate: "2026-09-01",
      status: "EXCELLENT",
    },
  ];

  return NextResponse.json({ success: true, data });
}
