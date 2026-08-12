import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Truck, QrCode, Loader2, UserPlus, FileImage,
  Store, ArrowUpRight, CheckCircle2,
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
      toast.success(json.message || "Vendor assigned successfully");
      setVendorOpen(false); onUpdate?.();
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
          <Button
            size="sm"
            onClick={markReadyForDelivery}
            className="h-8 rounded-xl text-white text-xs font-black gap-1.5 px-3"
            style={{ background: "var(--success)" }}
          >
            <CheckCircle2 size={12} /> Ready
          </Button>
        )}
        {!order.pickupAgentId && ["PENDING","CONFIRMED"].includes(order.orderStatus) && (
          <Button
            variant="outline"
            size="sm"
            onClick={openAssignModal}
            className="h-8 rounded-xl border-warning/30 hover:bg-warning/10 text-xs font-black px-3"
            style={{ color: "var(--warning)" }}
          >
            <Truck size={12} />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={openVendorModal}
          className="h-8 rounded-xl border-primary/25 hover:bg-primary/10 text-xs font-black px-3"
          style={{ color: "var(--primary)" }}
        >
          <Store size={12} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={openQrModal}
          className="h-8 rounded-xl border-border hover:bg-muted text-xs font-black px-3 text-muted-foreground"
        >
          <QrCode size={12} />
        </Button>
      </div>

      {/* ── Assign Vendor Dialog ─────────────────────────────────────────── */}
      <Dialog open={vendorOpen} onOpenChange={setVendorOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"
              style={{ color: "var(--primary)" }}>
              <Store size={20} />
            </div>
            <DialogTitle className="text-center text-base font-black text-card-foreground">
              Assign to Vendor
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Order #{order.orderNumber} — select a partner vendor based on available capacity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6" style={{ color: "var(--primary)" }} />
              </div>
            ) : vendors.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No vendors for this branch.</p>
            ) : (
              vendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-2xl border border-border p-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1">
                    <p className="font-black text-sm text-card-foreground">{v.businessName}</p>
                    <p className="text-xs text-muted-foreground">Code: {v.vendorCode} · {v.phone}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${v.availableCapacity > 0
                        ? "bg-success/10 text-success border-success/25"
                        : "bg-error/10 text-error border-error/25"}`}
                    >
                      {v.availableCapacity}/{v.dailyCapacity} slots available
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    disabled={v.isFull}
                    onClick={() => assignVendor(v.id)}
                    className="h-8 rounded-xl text-white font-black text-xs gap-1.5"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
                  >
                    Assign <ArrowUpRight size={12} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Assign Agent Dialog ──────────────────────────────────────────── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/10"
              style={{ color: "var(--warning)" }}>
              <Truck size={20} />
            </div>
            <DialogTitle className="text-center text-base font-black text-card-foreground">
              Assign Delivery Agent
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Select an available agent to handle this pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6" style={{ color: "var(--warning)" }} />
              </div>
            ) : agents.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No agents available.</p>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-2xl border border-border p-4 hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="font-black text-sm text-card-foreground">{agent.user?.fullName || agent.employeeCode}</p>
                    <p className="text-xs text-muted-foreground">{agent.phone}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => assignAgent(agent.id)}
                    className="h-8 rounded-xl text-white font-black text-xs gap-1.5"
                    style={{ background: "var(--warning)" }}
                  >
                    <UserPlus size={12} /> Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── QR Codes Dialog ──────────────────────────────────────────────── */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <QrCode size={20} />
            </div>
            <DialogTitle className="text-center text-base font-black text-card-foreground">
              Garment QR Codes
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Order #{order.orderNumber} — generate and view QR labels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No garments found for this order.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border p-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <p className="font-black text-sm text-card-foreground truncate">
                      {item.garmentName}
                      <span className="ml-1.5 text-xs text-muted-foreground font-mono">({item.garmentCode})</span>
                    </p>
                    {item.qrCodeRecord ? (
                      <p className="text-[10px] font-mono truncate" style={{ color: "var(--primary)" }}>
                        {item.qrCodeRecord.qrCode}
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold" style={{ color: "var(--warning)" }}>No QR code yet</p>
                    )}
                  </div>
                  <div className="shrink-0 ml-3">
                    {!item.qrCodeRecord ? (
                      <Button
                        size="sm"
                        onClick={() => generateQrCode(item.id)}
                        className="h-8 rounded-xl text-white text-xs font-black gap-1.5 px-3"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
                      >
                        <QrCode size={11} /> Generate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.qrCodeRecord.qrCode}`, "_blank")}
                        className="h-8 rounded-xl border-border text-muted-foreground text-xs font-black gap-1.5 px-3 hover:bg-muted"
                      >
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
