"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package, QrCode, Printer, CheckCircle2,
  Loader2, RefreshCw, Sparkles, Search,
  RotateCcw, Shirt, Inbox, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string; orderNumber: string; orderStatus: string;
  customerName: string; customerPhone: string; branch: string;
  totalGarments: number; qrGenerated: number; allQrDone: boolean;
  createdAt: string;
}

interface GarmentItem {
  id: string; garmentName: string; garmentCode: string; status: string;
  qrCodeRecord: { qrCode: string } | null;
  orderItem: { garmentType: { name: string } | null };
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { cls: string; dot: string }> = {
  PICKUP:     { cls: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500"    },
  PROCESSING: { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400"   },
  WASHING:    { cls: "bg-cyan-50    text-cyan-700    border-cyan-200",    dot: "bg-cyan-500"    },
  DRYING:     { cls: "bg-orange-50  text-orange-700  border-orange-200",  dot: "bg-orange-400"  },
  IRONING:    { cls: "bg-violet-50  text-violet-700  border-violet-200",  dot: "bg-violet-500"  },
  FOLDING:    { cls: "bg-pink-50    text-pink-700    border-pink-200",    dot: "bg-pink-400"    },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_META[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() { return localStorage.getItem("laundrix_token") ?? ""; }

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ""}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeOrdersPage() {
  const [orders, setOrders]               = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [garments, setGarments]           = useState<GarmentItem[]>([]);
  const [garmentLoading, setGarmentLoading] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/employee/orders", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) setOrders(json.data);
      else toast.error(json.message || "Failed to load orders");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  }, []);

  const fetchGarments = useCallback(async (orderId: string) => {
    setGarmentLoading(true);
    try {
      const res  = await fetch(`/api/employee/orders/${orderId}/qr-codes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) setGarments(json.data);
    } catch { toast.error("Failed to load garments"); }
    finally { setGarmentLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setGarments([]);
    fetchGarments(order.id);
  };

  const generateSingle = async (garmentItemId: string) => {
    const res  = await fetch(`/api/employee/garment-items/${garmentItemId}/generate-qr`, {
      method: "POST", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { toast.success("QR code generated!"); fetchGarments(selectedOrder!.id); fetchOrders(); }
    else toast.error("Failed to generate QR");
  };

  const generateAll = async () => {
    if (!selectedOrder) return;
    setGeneratingAll(true);
    try {
      const res  = await fetch(`/api/employee/orders/${selectedOrder.id}/generate-all-qr`, {
        method: "POST", headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) { toast.success(json.message || "All QR codes generated!"); fetchGarments(selectedOrder.id); fetchOrders(); }
      else toast.error("Failed to generate QR codes");
    } finally { setGeneratingAll(false); }
  };

  const printQr = (qrCode: string, label: string) => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Print QR – ${label}</title><style>
      body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0}
      img{width:200px;height:200px}p{font-size:12px;margin:4px 0;text-align:center}.code{font-size:10px;color:#555;font-family:monospace}
    </style></head><body onload="window.print()">
      <img src="${url}"/><p><strong>${label}</strong></p><p class="code">${qrCode}</p>
    </body></html>`);
    w.document.close();
  };

  const printAll = () => {
    const ready = garments.filter((g) => g.qrCodeRecord);
    if (ready.length === 0) { toast.error("No QR codes generated yet"); return; }
    const items = ready.map((g) =>
      `<div class="item"><img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(g.qrCodeRecord!.qrCode)}"/>
       <p><strong>${g.garmentName}</strong></p><p class="code">${g.qrCodeRecord!.qrCode}</p></div>`
    ).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Print All QRs – Order #${selectedOrder?.orderNumber}</title><style>
      body{font-family:sans-serif;padding:16px}h2{font-size:14px;margin-bottom:16px}
      .grid{display:flex;flex-wrap:wrap;gap:16px}.item{display:flex;flex-direction:column;align-items:center;border:1px solid #ddd;padding:8px;border-radius:6px;width:200px}
      img{width:180px;height:180px}p{font-size:11px;margin:3px 0;text-align:center}.code{font-size:9px;color:#666;font-family:monospace;word-break:break-all}
    </style></head><body onload="window.print()">
      <h2>Order #${selectedOrder?.orderNumber} — QR Labels</h2><div class="grid">${items}</div>
    </body></html>`);
    w.document.close();
  };

  const filtered = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Employee Workstation</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Garment Intake & QR Tagging</h1>
            <p className="mt-1 text-sm text-indigo-200">Manage picked-up orders — generate and print QR labels for each garment.</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Orders</p>
                <p className="text-white font-extrabold text-xl leading-tight">{orders.length}</p>
              </div>
              <Button onClick={fetchOrders} className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 shadow-sm gap-1.5">
                <RefreshCw size={14} /> Refresh
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition" />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <p className="ml-auto text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600">{filtered.length}</span> orders
          </p>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Order list ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <Package size={13} className="text-indigo-500" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Orders Awaiting Processing
            </h2>
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              {filtered.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0,1,2,3].map((i) => <Sk key={i} className="h-24" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50">
                <Inbox size={32} className="text-indigo-300" />
              </div>
              <p className="text-sm font-bold text-slate-800">No orders found</p>
              <p className="mt-1 text-xs text-slate-400">
                {search ? "Try a different search term." : "No pickup-stage orders at the moment."}
              </p>
            </div>
          ) : (
            filtered.map((order) => (
              <button key={order.id} onClick={() => openOrder(order)}
                className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                  ${selectedOrder?.id === order.id
                    ? "border-indigo-300 bg-indigo-50/60 shadow-md"
                    : "border-slate-100 bg-white shadow-sm hover:border-indigo-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-900 font-mono">#{order.orderNumber}</span>
                      <StatusPill status={order.orderStatus} />
                      {order.allQrDone && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 size={10} /> All Tagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{order.customerName} · {order.customerPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">QR Progress</p>
                    <p className="text-sm font-bold text-slate-900">{order.qrGenerated}/{order.totalGarments}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-500 ${order.allQrDone ? "bg-emerald-500" : "bg-indigo-500"}`}
                    style={{ width: order.totalGarments > 0 ? `${(order.qrGenerated / order.totalGarments) * 100}%` : "0%" }} />
                </div>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Shirt size={11} /> {order.totalGarments} garments</span>
                  <span className="flex items-center gap-1"><Tag size={11} /> {order.qrGenerated} tagged</span>
                  <span className="flex items-center gap-1"><Package size={11} /> {typeof order.branch === "string" ? order.branch : ((order.branch as any)?.branchName || (order.branch as any)?.name || "")}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ── Garment panel ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden sticky top-6">
          {!selectedOrder ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
                <QrCode size={38} className="text-indigo-300" />
              </div>
              <p className="text-base font-bold text-slate-800">Select an order</p>
              <p className="mt-2 text-sm text-slate-400">Click any order on the left to manage its QR codes and garments.</p>
            </div>
          ) : (
            <>
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-900 font-mono">#{selectedOrder.orderNumber}</span>
                    <StatusPill status={selectedOrder.orderStatus} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedOrder.customerName} · {selectedOrder.totalGarments} garments</p>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedOrder.allQrDone && (
                    <Button size="sm" onClick={generateAll} disabled={generatingAll}
                      className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 px-3">
                      {generatingAll ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
                      Generate All
                    </Button>
                  )}
                  {selectedOrder.qrGenerated > 0 && (
                    <Button size="sm" variant="outline" onClick={printAll}
                      className="h-8 rounded-xl text-xs font-bold gap-1.5 px-3 border-slate-200 text-slate-700 hover:bg-slate-50">
                      <Printer size={12} /> Print All
                    </Button>
                  )}
                </div>
              </div>

              {/* Garment list */}
              {garmentLoading ? (
                <div className="space-y-2 p-4">
                  {[0,1,2,3].map((i) => <Sk key={i} className="h-14" />)}
                </div>
              ) : garments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shirt size={28} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No garment items found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
                  {garments.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      {/* Garment icon */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${g.qrCodeRecord ? "bg-emerald-50" : "bg-slate-100"}`}>
                        <Shirt size={16} className={g.qrCodeRecord ? "text-emerald-500" : "text-slate-400"} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{g.garmentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{g.garmentCode}</p>
                        {g.qrCodeRecord && (
                          <p className="text-[10px] text-indigo-600 font-mono mt-0.5 truncate">{g.qrCodeRecord.qrCode}</p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {g.qrCodeRecord ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 size={11} /> Tagged
                            </span>
                            <Button size="sm" variant="outline" onClick={() => printQr(g.qrCodeRecord!.qrCode, g.garmentName)}
                              className="h-7 rounded-lg border-slate-200 text-xs font-bold gap-1 px-2.5 text-slate-600 hover:bg-slate-100">
                              <Printer size={11} /> Print
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => generateSingle(g.id)}
                            className="h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1 px-2.5">
                            <QrCode size={11} /> Generate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
