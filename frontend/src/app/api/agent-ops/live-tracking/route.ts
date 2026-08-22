import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: "AG-101",
      agentName: "Kamal Hossain",
      phone: "+8801711223344",
      assignedZone: "Uttara & Airport Road",
      activePickups: 3,
      activeDeliveries: 2,
      lat: 23.8759,
      lng: 90.3795,
      batteryLevel: "88%",
      currentStatus: "ON_ROUTE",
      lastPing: "Just now",
    },
    {
      id: "AG-102",
      agentName: "Rafiqul Islam",
      phone: "+8801819887766",
      assignedZone: "Gulshan & Banani",
      activePickups: 1,
      activeDeliveries: 4,
      lat: 23.7925,
      lng: 90.4078,
      batteryLevel: "64%",
      currentStatus: "AT_CUSTOMER_LOCATION",
      lastPing: "1 Min ago",
    },
    {
      id: "AG-103",
      agentName: "Jahid Hasan",
      phone: "+8801912345678",
      assignedZone: "Dhanmondi & Mirpur",
      activePickups: 0,
      activeDeliveries: 0,
      lat: 23.7461,
      lng: 90.3742,
      batteryLevel: "95%",
      currentStatus: "IDLE_AT_BRANCH",
      lastPing: "3 Mins ago",
    },
    {
      id: "AG-104",
      agentName: "Mahbubur Rahman",
      phone: "+8801678901234",
      assignedZone: "Motijheel & Baily Road",
      activePickups: 2,
      activeDeliveries: 1,
      lat: 23.733,
      lng: 90.4172,
      batteryLevel: "42%",
      currentStatus: "ON_ROUTE",
      lastPing: "Just now",
    },
  ];

  return NextResponse.json({ success: true, data });
}
