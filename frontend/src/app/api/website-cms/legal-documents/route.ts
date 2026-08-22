import { NextResponse } from "next/server";

export async function GET() {
  const documents = [
    {
      id: "LEG-01",
      title: "Terms of Service & Garment Damage Policy",
      slug: "terms-of-service",
      version: "v2.4",
      lastUpdated: "2026-06-15",
      status: "PUBLISHED",
    },
    {
      id: "LEG-02",
      title: "Privacy & Customer Data Policy",
      slug: "privacy-policy",
      version: "v1.8",
      lastUpdated: "2026-05-10",
      status: "PUBLISHED",
    },
    {
      id: "LEG-03",
      title: "Refund & Cancellation Policy",
      slug: "refund-policy",
      version: "v2.1",
      lastUpdated: "2026-07-01",
      status: "PUBLISHED",
    },
  ];
  return NextResponse.json({ success: true, data: documents });
}
