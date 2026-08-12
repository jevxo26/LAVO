"use client";

import { CheckCircle2, ClipboardList, Loader2, Printer, QrCode, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./StatusPill";
import { GarmentPanelSkeleton, GarmentRowSkeleton } from "./Skeletons";
import type { Order } from "./OrderList";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GarmentItem {
  id: string; garmentName: string; garmentCode: string; status: string;
  qrCodeRecord: { qrCode: string } | null;
  orderItem: {
    garmentType?: { name: string } | null;
    service?: { serviceName: string; category?: string } | null;
  } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface GarmentPanelProps {
  loading: boolean;
  selectedOrder: Order | null;
  garments: GarmentItem[];
  garmentLoading: boolean;
  generatingAll: boolean;
  onGenerateAll: () => void;
  onGenerateSingle: (id: string) => void;
  onPrintQr: (qrCode: string, label: string) => void;
  onPrintAll: () => void;
}

export function GarmentPanel({
  loading, selectedOrder, garments, garmentLoading, generatingAll,
  onGenerateAll, onGenerateSingle, onPrintQr, onPrintAll,
}: GarmentPanelProps) {
  if (loading) return <GarmentPanelSkeleton />;

  if (!selectedOrder) return (
    <div className="rounded-3xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-24 text-center px-8">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        <ClipboardList size={38} />
      </div>
      <p className="text-base font-black text-card-foreground">No orders to process</p>
      <p className="mt-2 text-sm text-muted-foreground font-medium">
        Orders will appear here once garments have been picked up from customers.
      </p>
    </div>
  );

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black text-card-foreground font-mono">
              #{selectedOrder.orderNumber}
            </span>
            <StatusPill status={selectedOrder.orderStatus} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {selectedOrder.customerName} · {selectedOrder.totalGarments} garments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!selectedOrder.allQrDone && (
            <Button
              size="sm"
              onClick={onGenerateAll}
              disabled={generatingAll}
              className="h-8 rounded-xl text-white text-xs font-black gap-1.5 px-3"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              {generatingAll ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
              Generate All
            </Button>
          )}
          {selectedOrder.qrGenerated > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={onPrintAll}
              className="h-8 rounded-xl text-xs font-black gap-1.5 px-3 border-border text-card-foreground hover:bg-muted"
            >
              <Printer size={12} /> Print All
            </Button>
          )}
        </div>
      </div>

      {/* Garment rows */}
      {garmentLoading ? (
        <GarmentRowSkeleton />
      ) : garments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Shirt size={28} className="text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No garment items found</p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {garments.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
            >
              {/* Icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                g.qrCodeRecord ? "bg-success/10" : "bg-muted"
              }`}>
                <Shirt
                  size={16}
                  className={g.qrCodeRecord ? "text-success" : "text-muted-foreground"}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-black text-card-foreground leading-tight">{g.garmentName}</p>
                  {g.orderItem?.service?.serviceName && (
                    <span
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-black"
                      style={{ color: "var(--primary)" }}
                    >
                      {g.orderItem.service.serviceName}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{g.garmentCode}</p>
                {g.qrCodeRecord && (
                  <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: "var(--primary)" }}>
                    {g.qrCodeRecord.qrCode}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {g.qrCodeRecord ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-success">
                      <CheckCircle2 size={11} /> Tagged
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrintQr(g.qrCodeRecord!.qrCode, g.garmentName)}
                      className="h-7 rounded-lg border-border text-xs font-black gap-1 px-2.5 hover:bg-muted"
                    >
                      <Printer size={11} /> Print
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onGenerateSingle(g.id)}
                    className="h-7 rounded-lg text-white text-xs font-black gap-1 px-2.5"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
                  >
                    <QrCode size={11} /> Generate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
