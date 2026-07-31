import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fallback = [
      {
        id: "WTX-88101",
        userName: "Alice Morgan",
        userEmail: "alice@example.com",
        type: "CREDIT",
        amount: 100.0,
        purpose: "Wallet Top-up via Bkash",
        status: "COMPLETED",
        reference: "TRX-BK-99120",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "WTX-88102",
        userName: "Robert Sterling",
        userEmail: "robert@example.com",
        type: "DEBIT",
        amount: 34.5,
        purpose: "Order Payment #ORD-9018",
        status: "COMPLETED",
        reference: "ORD-9018",
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: "WTX-88103",
        userName: "Kazi Nabil",
        userEmail: "nabil@example.com",
        type: "REFUND",
        amount: 15.0,
        purpose: "Service Delay Cash Back",
        status: "COMPLETED",
        reference: "RF-7721",
        createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      },
      {
        id: "WTX-88104",
        userName: "Tanvir Ahmed",
        userEmail: "tanvir@example.com",
        type: "CREDIT",
        amount: 50.0,
        purpose: "Promo Cashback Reward",
        status: "COMPLETED",
        reference: "PROMO-SUMMER26",
        createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      },
    ];

    return NextResponse.json({ success: true, data: fallback });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch wallet transactions" },
      { status: 500 }
    );
  }
}
