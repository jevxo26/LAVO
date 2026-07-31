import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Truck, QrCode, Loader2, UserPlus, FileImage,
  Store, ArrowUpRight, CheckCircle2, Package,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function OrderActions({ order, onUpdate }: { order: any; onUpdate?: () => void }) {
  const [agents, setAgents]   = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [qrOpen, setQrOpen]         = useState(false);

  const token = () => localStorage.getItem("laundrix_token");

  const openAssignModal = async () => {
    setAssignOpen(true); setLoading(true);
    try {
      const res  = await fetch("/api/branch-dashboard/delivery-agents", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (res.ok) setAgents(json.data);
    } catch { toast.error("Failed to load agents"); }
    finally { setLoading(false); }
  };

  const openVendorModal = async () => {
    setVendorOpen(true); setLoading(true);
    try {
      const res  = await fetch("/api/branch-dashboard/vendors", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (res.ok && json.success) setVendors(json.data.vendors || []);
    } catch { toast.error("Failed to load vendors"); }
    finally { setLoading(false); }
  };

  const assignVendor = async (vendorId: string) => {
    const res  = await fetch("/api/branch-dashboard/vendors/assign-order", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, vendorId }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      toast.success(json.message || "Vendor assigned successfully"); setVendorOpen(false); onUpdate?.();
    } else { toast.error(json.message || "Failed to assign vendor"); }
  };

  const assignAgent = async (agentId: string) => {
    const res  = await fetch("/api/branch-dashboard/orders/assign-agent", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, agentId }),
    });
    if (res.ok) { toast.success("Agent assigned"); setAssignOpen(false); onUpdate?.(); }
    else { toast.error("Failed to assign agent"); }
  };

  const openQrModal = async () => {
    setQrOpen(true); setLoading(true);
    try {
      const res  = await fetch(`/api/branch-dashboard/orders/${order.id}/qr-codes`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (res.ok) setItems(json.data);
    } catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  };

  const generateQrCode = async (garmentItemId: string) => {
    const res = await fetch(`/api/branch-dashboard/garment-items/${garmentItemId}/generate-qr`, {
      method: "POST", headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      toast.success("QR Code generated");
      const r = await fetch(`/api/branch-dashboard/orders/${order.id}/qr-codes`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const j = await r.json();
      if (r.ok) setItems(j.data);
    } else { toast.error("Failed to generate QR"); }
  };

  const markReadyForDelivery = async () => {
    const res = await fetch(`/api/branch-dashboard/orders/${order.id}/ready-for-delivery`, {
      method: "PUT", headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) { toast.success("Order marked Ready! Delivery agent auto-assigned."); onUpdate?.(); }
    else { toast.error("Failed to mark order ready"); }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {order.orderStatus === "PROCESSING" && (
          <Button size="sm" onClick={markReadyForDelivery}
            className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 px-3">
            <CheckCircle2 size={12} /> Ready
          </Button>
        )}
        {!order.pickupAgentId && ["PENDING","CONFIRMED"].includes(order.orderStatus) && (
          <Button variant="outline" size="sm" onClick={openAssignModal}
            className="h-8 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold px-3">
            <Truck size={12} />
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={openVendorModal}
          className="h-8 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold px-3">
          <Store size={12} />
        </Button>
        <Button variant="outline" size="sm" onClick={openQrModal}
          className="h-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-3">
          <QrCode size={12} />
        </Button>
      </div>

      {/* ── Assign Vendor dialog ─────────────────────────────────────────── */}
      <Dialog open={vendorOpen} onOpenChange={setVendorOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
              <Store size={20} className="text-indigo-500" />
            </div>
            <DialogTitle className="text-center text-base font-extrabold text-slate-900">
              Assign to Vendor
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400">
              Order #{order.orderNumber} — select a partner vendor based on available capacity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-indigo-500" /></div>
            ) : vendors.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">No vendors for this branch.</p>
            ) : (
              vendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-900">{v.businessName}</p>
                    <p className="text-xs text-slate-400">Code: {v.vendorCode} · {v.phone}</p>
                    <Badge variant="outline"
                      className={v.availableCapacity > 0
                        ? "text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "text-[10px] bg-rose-50 text-rose-700 border-rose-200"}>
                      {v.availableCapacity}/{v.dailyCapacity} slots available
                    </Badge>
                  </div>
                  <Button size="sm" disabled={v.isFull} onClick={() => assignVendor(v.id)}
                    className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5">
                    Assign <ArrowUpRight size={12} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Assign Agent dialog ──────────────────────────────────────────── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
              <Truck size={20} className="text-orange-500" />
            </div>
            <DialogTitle className="text-center text-base font-extrabold text-slate-900">Assign Delivery Agent</DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400">
              Select an available agent to handle this pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-orange-500" /></div>
            ) : agents.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">No agents available.</p>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{agent.user?.fullName || agent.employeeCode}</p>
                    <p className="text-xs text-slate-400">{agent.phone}</p>
                  </div>
                  <Button size="sm" onClick={() => assignAgent(agent.id)}
                    className="h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5">
                    <UserPlus size={12} /> Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── QR Codes dialog ──────────────────────────────────────────────── */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <QrCode size={20} className="text-slate-600" />
            </div>
            <DialogTitle className="text-center text-base font-extrabold text-slate-900">Garment QR Codes</DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400">
              Order #{order.orderNumber} — generate and view QR labels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-slate-500" /></div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">No garments found for this order.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {item.garmentName}
                      <span className="ml-1.5 text-xs text-slate-400 font-mono">({item.garmentCode})</span>
                    </p>
                    {item.qrCodeRecord ? (
                      <p className="text-[10px] font-mono text-indigo-600 truncate">{item.qrCodeRecord.qrCode}</p>
                    ) : (
                      <p className="text-[11px] text-amber-600 font-medium">No QR code yet</p>
                    )}
                  </div>
                  <div className="shrink-0 ml-3">
                    {!item.qrCodeRecord ? (
                      <Button size="sm" onClick={() => generateQrCode(item.id)}
                        className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 px-3">
                        <QrCode size={11} /> Generate
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm"
                        onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.qrCodeRecord.qrCode}`, "_blank")}
                        className="h-8 rounded-xl border-slate-200 text-slate-600 text-xs font-bold gap-1.5 px-3">
                        <FileImage size={11} /> View
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
