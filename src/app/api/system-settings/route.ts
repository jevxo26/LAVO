import { NextResponse } from "next/server";

export async function GET() {
  const settings = {
    pricingTax: {
      vatTaxPercentage: 15,
      serviceChargePercentage: 5,
      currency: "BDT",
      minimumOrderAmount: 150,
    },
    deliveryCharges: {
      baseExpressFee: 60,
      standardPickupFee: 30,
      freeDeliveryThreshold: 500,
      surgeMultiplier: 1.2,
    },
    featureFlags: {
      enableVendorMarketplace: true,
      enableLiveAgentTracking: true,
      enableWalletCashback: true,
      enableSMSNotifications: true,
      enableMaintenanceMode: false,
    },
  };
  return NextResponse.json({ success: true, data: settings });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, message: "System settings updated successfully", data: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
