"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, QrCode, Printer, CheckCircle2, Clock, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  customerName: string;
  customerPhone: string;
  branch: string;
  totalGarments: number;
  qrGenerated: number;
  allQrDone: boolean;
  createdAt: string;
}

interface GarmentItem {
  id: string;
  garmentName: string;
  garmentCode: string;
  status: string;
  qrCodeRecord: { qrCode: string } | null;
  orderItem: { garmentType: { name: string } | null };
}

const STATUS_COLOR: Record<string, string> = {
  PICKUP: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  WASHING: "bg-cyan-100 text-cyan-700",
  DRYING: "bg-orange-100 text-orange-700",
  IRONING: "bg-purple-100 text-purple-700",
  FOLDING: "bg-pink-100 text-pink-700",
};

function getToken() {
  return localStorage.getItem("laundrix_token") ?? "";
}

export default function EmployeeOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [garmentLoading, setGarmentLoading] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employee/orders", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) setOrders(json.data);
      else toast.error(json.message || "Failed to load orders");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGarments = useCallback(async (orderId: string) => {
    setGarmentLoading(true);
    try {
      const res = await fetch(`/api/employee/orders/${orderId}/qr-codes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) setGarments(json.data);
    } catch {
      toast.error("Failed to load garments");
    } finally {
      setGarmentLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setGarments([]);
    fetchGarments(order.id);
  };

  const generateSingle = async (garmentItemId: string) => {
    try {
      const res = await fetch(`/api/employee/garment-items/${garmentItemId}/generate-qr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast.success("QR code generated!");
        fetchGarments(selectedOrder!.id);
        fetchOrders();
      } else toast.error("Failed to generate QR");
    } catch {
      toast.error("Network error");
    }
  };

  const generateAll = async () => {
    if (!selectedOrder) return;
    setGeneratingAll(true);
    try {
      const res = await fetch(`/api/employee/orders/${selectedOrder.id}/generate-all-qr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "All QR codes generated!");
        fetchGarments(selectedOrder.id);
        fetchOrders();
      } else toast.error("Failed to generate QR codes");
    } catch {
      toast.error("Network error");
    } finally {
      setGeneratingAll(false);
    }
  };

  const printQr = (qrCode: string, label: string) => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Print QR – ${label}</title><style>
        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        img { width: 200px; height: 200px; }
        p { font-size: 12px; margin: 4px 0; text-align: center; }
        .code { font-size: 10px; color: #555; font-family: monospace; }
      </style></head><body onload="window.print()">
        <img src="${url}" />
        <p><strong>${label}</strong></p>
        <p class="code">${qrCode}</p>
      </body></html>
    `);
    w.document.close();
  };

  const printAll = () => {
    const ready = garments.filter(g => g.qrCodeRecord);
    if (ready.length === 0) { toast.error("No QR codes generated yet"); return; }
    const items = ready.map(g =>
      `<div class="item">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(g.qrCodeRecord!.qrCode)}" />
        <p><strong>${g.garmentName}</strong></p>
        <p class="code">${g.qrCodeRecord!.qrCode}</p>
      </div>`
    ).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Print All QRs – Order #${selectedOrder?.orderNumber}</title><style>
        body { font-family: sans-serif; padding: 16px; }
        h2 { font-size: 14px; margin-bottom: 16px; }
        .grid { display: flex; flex-wrap: wrap; gap: 16px; }
        .item { display: flex; flex-direction: column; align-items: center; border: 1px solid #ddd; padding: 8px; border-radius: 6px; width: 200px; }
        img { width: 180px; height: 180px; }
        p { font-size: 11px; margin: 3px 0; text-align: center; }
        .code { font-size: 9px; color: #666; font-family: monospace; word-break: break-all; }
      </style></head><body onload="window.print()">
        <h2>Order #${selectedOrder?.orderNumber} — QR Labels</h2>
        <div class="grid">${items}</div>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Garment Intake & QR Tagging</h1>
          <p className="text-slate-500 text-sm mt-1">Manage picked-up orders — generate and print QR labels for each garment</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 border rounded-lg px-3 py-2"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Orders Awaiting Processing ({orders.length})
          </h2>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Package size={48} className="mx-auto mb-3 opacity-40" />
              <p>No orders in pickup stage</p>
            </div>
          ) : (
            orders.map(order => (
              <button
                key={order.id}
                onClick={() => openOrder(order)}
                className={`w-full text-left border rounded-xl p-4 transition-all hover:border-indigo-400 hover:shadow-sm ${
                  selectedOrder?.id === order.id ? "border-indigo-500 bg-indigo-50 shadow" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">#{order.orderNumber}</p>
                    <p className="text-sm text-slate-500">{order.customerName} · {order.customerPhone}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[order.orderStatus] || "bg-slate-100 text-slate-600"}`}>
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Package size={12} /> {order.totalGarments} garments
                  </span>
                  <span className="flex items-center gap-1">
                    <QrCode size={12} /> {order.qrGenerated}/{order.totalGarments} QR done
                  </span>
                  {order.allQrDone && (
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle2 size={12} /> All tagged
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-2 bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: order.totalGarments > 0 ? `${(order.qrGenerated / order.totalGarments) * 100}%` : "0%" }}
                  />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Garment Details Panel */}
        <div className="bg-white border rounded-xl p-5">
          {!selectedOrder ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-300">
              <QrCode size={56} className="mb-3 opacity-40" />
              <p className="text-sm">Select an order to manage QR codes</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">#{selectedOrder.orderNumber}</h3>
                  <p className="text-xs text-slate-500">{selectedOrder.customerName}</p>
                </div>
                <div className="flex gap-2">
                  {!selectedOrder.allQrDone && (
                    <button
                      onClick={generateAll}
                      disabled={generatingAll}
                      className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {generatingAll ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
                      Generate All
                    </button>
                  )}
                  {selectedOrder.qrGenerated > 0 && (
                    <button
                      onClick={printAll}
                      className="flex items-center gap-1.5 text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                    >
                      <Printer size={12} /> Print All
                    </button>
                  )}
                </div>
              </div>

              {garmentLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-slate-400" size={28} />
                </div>
              ) : garments.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No garment items found</p>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {garments.map(g => (
                    <div key={g.id} className="flex items-center justify-between border rounded-lg px-3 py-2.5 bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{g.garmentName}</p>
                        <p className="text-xs text-slate-400 font-mono">{g.garmentCode}</p>
                        {g.qrCodeRecord && (
                          <p className="text-xs text-indigo-600 font-mono mt-0.5">{g.qrCodeRecord.qrCode}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {g.qrCodeRecord ? (
                          <>
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 size={12} /> Tagged
                            </span>
                            <button
                              onClick={() => printQr(g.qrCodeRecord!.qrCode, g.garmentName)}
                              className="flex items-center gap-1 text-xs border border-slate-300 bg-white px-2 py-1 rounded hover:bg-slate-100"
                            >
                              <Printer size={11} /> Print
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => generateSingle(g.id)}
                            className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                          >
                            <QrCode size={11} /> Generate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
