"use client";

import { useEffect, useState, useCallback } from "react";
import { QrCode, Search, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OrderList }   from "./_components/OrderList";
import { GarmentPanel } from "./_components/GarmentPanel";
import type { Order, FilterTab } from "./_components/OrderList";
import type { GarmentItem }      from "./_components/GarmentPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() { return localStorage.getItem("laundrix_token") ?? ""; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeOrdersPage() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState<FilterTab>("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [garments, setGarments]         = useState<GarmentItem[]>([]);
  const [garmentLoading, setGarmentLoading] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/employee/orders", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) {
        const data: Order[] = json.data ?? [];
        setOrders(data);
        if (data.length > 0) { setSelectedOrder(data[0]); fetchGarments(data[0].id); }
        else { setSelectedOrder(null); setGarments([]); }
      } else { toast.error(json.message || "Failed to load orders"); }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  }, [fetchGarments]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order); setGarments([]);
    fetchGarments(order.id);
  };

  const handleGenerateSingle = async (garmentItemId: string) => {
    const res = await fetch(`/api/employee/garment-items/${garmentItemId}/generate-qr`, {
      method: "POST", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { toast.success("QR code generated!"); fetchGarments(selectedOrder!.id); fetchOrders(); }
    else toast.error("Failed to generate QR");
  };

  const handleGenerateAll = async () => {
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

  const handlePrintQr = (qrCode: string, label: string) => {
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

  const handlePrintAll = () => {
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const pendingCount    = orders.filter((o) => !o.allQrDone).length;
  const inProgressCount = orders.filter((o) => o.allQrDone).length;

  const tabFiltered = orders.filter((o) =>
    activeTab === "pending"     ? !o.allQrDone :
    activeTab === "in_progress" ?  o.allQrDone : true
  );
  const filtered = tabFiltered.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Employee Workstation"
        title="Garment Intake & QR Tagging"
        description="Manage picked-up orders — generate and print QR labels for each garment."
        icon={QrCode}
        chips={!loading ? [
          { label: "Total Orders",  value: orders.length   },
          { label: "Needs Tagging", value: pendingCount    },
          { label: "Fully Tagged",  value: inProgressCount },
        ] : []}
      />

      {/* ── 2. Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-muted-foreground" size={14} />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer…"
              className="w-full h-10 pl-10 pr-4 rounded-2xl border border-border bg-muted/50 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-error gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <p className="ml-auto text-[11px] text-muted-foreground">
            {loading
              ? <span className="inline-flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Loading…</span>
              : <><span className="font-black text-card-foreground">{filtered.length}</span> orders</>}
          </p>
        </div>
      </div>

      {/* ── 3. Main Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <OrderList
          orders={orders}
          filtered={filtered}
          loading={loading}
          search={search}
          activeTab={activeTab}
          selectedOrderId={selectedOrder?.id ?? null}
          pendingCount={pendingCount}
          inProgressCount={inProgressCount}
          onTabChange={setActiveTab}
          onSelectOrder={handleSelectOrder}
        />

        <div className="sticky top-6">
          <GarmentPanel
            loading={loading}
            selectedOrder={selectedOrder}
            garments={garments}
            garmentLoading={garmentLoading}
            generatingAll={generatingAll}
            onGenerateAll={handleGenerateAll}
            onGenerateSingle={handleGenerateSingle}
            onPrintQr={handlePrintQr}
            onPrintAll={handlePrintAll}
          />
        </div>
      </div>
    </motion.div>
  );
}
