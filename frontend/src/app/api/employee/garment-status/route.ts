import { NextRequest, NextResponse } from "next/server";

// ─── Service → Processing Stages Map ─────────────────────────────────────────
// Each service name keyword maps to the ordered list of stages an employee
// must complete. The scanner will only show relevant stages for that service.

export const SERVICE_STAGES: Record<string, string[]> = {
  "wash only":       ["WASHING", "DRYING", "FOLDING", "READY_FOR_DELIVERY"],
  "wash & iron":     ["WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY"],
  "wash and iron":   ["WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY"],
  "dry cleaning":    ["DRY_CLEANING", "PRESSING", "FOLDING", "READY_FOR_DELIVERY"],
  "dry clean":       ["DRY_CLEANING", "PRESSING", "FOLDING", "READY_FOR_DELIVERY"],
  "steam iron":      ["IRONING", "FOLDING", "READY_FOR_DELIVERY"],
  "ironing":         ["IRONING", "FOLDING", "READY_FOR_DELIVERY"],
  "stain removal":   ["STAIN_TREATMENT", "WASHING", "DRYING", "FOLDING", "READY_FOR_DELIVERY"],
  "premium care":    ["PROCESSING", "WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY"],
  "fold only":       ["FOLDING", "READY_FOR_DELIVERY"],
  "wash & fold":     ["WASHING", "DRYING", "FOLDING", "READY_FOR_DELIVERY"],
  "wash and fold":   ["WASHING", "DRYING", "FOLDING", "READY_FOR_DELIVERY"],
  "delicate care":   ["PROCESSING", "WASHING", "DRYING", "FOLDING", "READY_FOR_DELIVERY"],
  "default":         ["PROCESSING", "WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY"],
};

export function getStagesForService(serviceName: string | null | undefined): string[] {
  if (!serviceName) return SERVICE_STAGES["default"];
  const lower = serviceName.toLowerCase().trim();
  for (const [key, stages] of Object.entries(SERVICE_STAGES)) {
    if (lower.includes(key)) return stages;
  }
  return SERVICE_STAGES["default"];
}

// ─── In-memory garment status store (fallback for dev/demo) ──────────────────
// In production this is replaced by real DB queries via the backend API.

interface GarmentRecord {
  status: string;
  serviceName?: string;
  orderNumber?: string;
  garmentName?: string;
  lastUpdated: string;
  updatedBy?: string;
}

const garmentStore: Record<string, GarmentRecord> = {
  "ORD-1001": { status: "COLLECTED",  serviceName: "Wash & Iron",   orderNumber: "ORD-1001", garmentName: "Shirt",   lastUpdated: new Date().toISOString() },
  "ORD-1002": { status: "WASHING",    serviceName: "Wash Only",     orderNumber: "ORD-1002", garmentName: "Pants",   lastUpdated: new Date().toISOString() },
  "GAR-501":  { status: "IRONING",    serviceName: "Steam Iron",    orderNumber: "ORD-9001", garmentName: "Suit",    lastUpdated: new Date().toISOString() },
};

// ─── GET /api/employee/garment-status?qrCode=... ──────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrCode = (searchParams.get("qrCode") || searchParams.get("code") || "").trim();

    if (!qrCode) {
      return NextResponse.json({ success: false, message: "Missing qrCode parameter" }, { status: 400 });
    }

    const codeKey = qrCode.toUpperCase();
    const record  = garmentStore[codeKey];

    if (!record) {
      // Unknown code — return default COLLECTED status so employee can progress it
      return NextResponse.json({
        success: true,
        data: {
          qrCode:      codeKey,
          status:      "COLLECTED",
          serviceName: null,
          orderNumber: null,
          garmentName: null,
          stages:      SERVICE_STAGES["default"],
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        qrCode:      codeKey,
        status:      record.status,
        serviceName: record.serviceName ?? null,
        orderNumber: record.orderNumber ?? null,
        garmentName: record.garmentName ?? null,
        stages:      getStagesForService(record.serviceName),
        lastUpdated: record.lastUpdated,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to fetch garment status" }, { status: 500 });
  }
}

// ─── POST /api/employee/garment-status ───────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCode, status, employeeId, branchId } = body;

    if (!qrCode || !status) {
      return NextResponse.json({ success: false, message: "Missing qrCode or status" }, { status: 400 });
    }

    const codeKey      = qrCode.trim().toUpperCase();
    const existing     = garmentStore[codeKey];
    const serviceName  = existing?.serviceName ?? body.serviceName ?? null;
    const orderNumber  = existing?.orderNumber ?? body.orderNumber ?? null;
    const garmentName  = existing?.garmentName ?? body.garmentName ?? null;

    garmentStore[codeKey] = {
      status:      status.toUpperCase(),
      serviceName,
      orderNumber,
      garmentName,
      lastUpdated: new Date().toISOString(),
      updatedBy:   employeeId || "employee",
    };

    return NextResponse.json({
      success: true,
      message: `Garment ${codeKey} updated to ${status}`,
      data: {
        qrCode:      codeKey,
        status:      status.toUpperCase(),
        serviceName,
        orderNumber,
        stages:      getStagesForService(serviceName),
        branchId,
        timestamp:   new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to update garment status" }, { status: 500 });
  }
}
