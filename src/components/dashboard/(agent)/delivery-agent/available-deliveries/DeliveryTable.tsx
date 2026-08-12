"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Truck, User, Phone, MapPin, Ruler,
  Shirt, Store, Building2, CreditCard,
  Weight, Package, CheckCircle2, Inbox, Loader2,
  XCircle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AvailableDelivery } from "../types";
import { toast } from "@/lib/toast";
import Loading from "../Loading";
import { motion } from "framer-motion";

// ─── Priority pill ────────────────────────────────────────────────────────────

const PRIORITY: Record<string, { cls: string; dot: string }> = {
  HIGH:   { cls: "bg-error/10 text-error border-error/25",       dot: "bg-error"   },
  MEDIUM: { cls: "bg-warning/10 text-warning border-warning/25", dot: "bg-warning" },
  LOW:    { cls: "bg-success/10 text-success border-success/25", dot: "bg-success" },
};

function PriorityPill({ priority }: { priority: string }) {
  const s = PRIORITY[priority?.toUpperCase()] ?? PRIORITY.LOW;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {priority}
    </span>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { cls: string; dot: string }> = {
  PENDING:     { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse" },
  ACCEPTED:    { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary"               },
  IN_PROGRESS: { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary animate-pulse" },
  COMPLETED:   { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success"               },
  CANCELLED:   { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error"                 },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status?.toUpperCase()] ?? { cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Start delivery dialog ────────────────────────────────────────────────────

function StartConfirmDialog({ delivery, open, onClose, onConfirm, loading }: {
  delivery: AvailableDelivery | null; open: boolean;
  onClose: () => void; onConfirm: () => Promise<void>; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-3xl border border-border bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Truck size={22} />
          </div>
          <DialogTitle className="text-center text-base font-black text-card-foreground">Start Delivery</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Confirm you want to start the drop-off delivery.
          </DialogDescription>
        </DialogHeader>

        {delivery && (
          <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 space-y-2 text-xs">
            {[
              { label: "Order ID",   value: `#${delivery.orderId}`,            mono: true    },
              { label: "Customer",   value: delivery.customerName                             },
              { label: "Garments",   value: `${delivery.totalGarments ?? 1} item(s)`, primary: true },
              { label: "Distance",   value: delivery.distance                                },
              ...(delivery.codAmount > 0
                ? [{ label: "COD Amount", value: `৳${delivery.codAmount}`, success: true }]
                : []),
            ].map(({ label, value, mono, primary, success }: any) => value && (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className={`font-black ${mono ? "font-mono text-card-foreground" : ""}`}
                  style={primary ? { color: "var(--primary)" } : success ? { color: "var(--success)" } : undefined}>
                  {!primary && !success && !mono ? <span className="text-card-foreground">{value}</span> : value}
                </span>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10 font-bold">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl h-10 font-black gap-1.5 text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Starting…</>
              : <><Truck size={14} /> Start Delivery</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Decline dialog ───────────────────────────────────────────────────────────

function DeclineConfirmDialog({ delivery, open, onClose, onConfirm, loading }: {
  delivery: AvailableDelivery | null; open: boolean;
  onClose: () => void; onConfirm: () => Promise<void>; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-3xl border border-border bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertTriangle size={22} />
          </div>
          <DialogTitle className="text-center text-base font-black text-card-foreground">Decline Delivery</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            This delivery will be returned to the queue for another agent to accept.
          </DialogDescription>
        </DialogHeader>

        {delivery && (
          <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Order ID</span>
              <span className="font-black font-mono text-card-foreground">#{delivery.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Customer</span>
              <span className="font-bold text-card-foreground">{delivery.customerName}</span>
            </div>
            {delivery.codAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">COD Amount</span>
                <span className="font-black text-success">৳{delivery.codAmount}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10 font-bold">Go Back</Button>
          <Button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl h-10 font-black gap-1.5 text-white"
            style={{ background: "var(--error)" }}>
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Declining…</>
              : <><XCircle size={14} /> Decline Delivery</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DeliveryCard ─────────────────────────────────────────────────────────────

function DeliveryCard({ delivery, onStart, onDecline }: {
  delivery: AvailableDelivery;
  onStart:   (d: AvailableDelivery) => void;
  onDecline: (d: AvailableDelivery) => void;
}) {
  const isStarted = delivery.status === "IN_PROGRESS" || delivery.status === "ACCEPTED";
  const src       = delivery.pickupSource;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-card p-5 shadow-sm transition-all duration-200 ${
        isStarted
          ? "border-primary/25 hover:border-primary/40"
          : "border-border hover:border-primary/30 hover:shadow-md"
      }`}
    >
      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
          style={{ color: "var(--primary)" }}>
          <Truck size={20} />
        </div>

        <div className="space-y-1.5 min-w-0">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black text-card-foreground font-mono">#{delivery.orderId}</span>
            <StatusPill status={delivery.status} />
            {delivery.priority && <PriorityPill priority={delivery.priority} />}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-black text-card-foreground">{delivery.customerName}</span>
            </span>
            <span className="flex items-center gap-1"><Phone size={11} />{delivery.customerPhone}</span>
            <span className="flex items-center gap-1">
              <Shirt size={11} />
              <span className="font-black" style={{ color: "var(--primary)" }}>{delivery.totalGarments ?? 1} garment(s)</span>
            </span>
            {delivery.distance && delivery.distance !== "N/A" && (
              <span className="flex items-center gap-1">
                <Ruler size={11} />
                <span className="font-black" style={{ color: "var(--secondary)" }}>{delivery.distance}</span>
              </span>
            )}
          </div>

          {/* Row 3 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {delivery.deliveryAddress && (
              <span className="flex items-center gap-1 max-w-[220px] truncate">
                <MapPin size={11} className="shrink-0" />{delivery.deliveryAddress}
              </span>
            )}
            {src && (
              <span className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-black ${
                src.isVendor
                  ? "bg-secondary/10 text-secondary border-secondary/25"
                  : "bg-primary/10 border-primary/20"
              }`} style={!src.isVendor ? { color: "var(--primary)" } : undefined}>
                {src.isVendor ? <Store size={10} /> : <Building2 size={10} />}
                {src.isVendor
                  ? `From Vendor: ${src.name}`
                  : `From Hub: ${src.name || (typeof delivery.branch === "string" ? delivery.branch : ((delivery.branch as any)?.branchName || (delivery.branch as any)?.name || ""))}`}
              </span>
            )}
            {delivery.parcelType && <span className="flex items-center gap-1"><Package size={11} />{delivery.parcelType}</span>}
            {delivery.weight      && <span className="flex items-center gap-1"><Weight size={11} />{delivery.weight}</span>}
            {delivery.paymentType && (
              <span className="flex items-center gap-1">
                <CreditCard size={11} />{delivery.paymentType}
                {delivery.codAmount > 0 && (
                  <span className="ml-0.5 font-black text-success">৳{delivery.codAmount}</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="shrink-0 self-start sm:self-center">
        {isStarted ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[11px] font-black"
            style={{ color: "var(--primary)" }}>
            <CheckCircle2 size={13} /> In Progress
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onDecline(delivery)}
              className="h-9 rounded-xl text-xs font-black gap-1.5 border-error/25 text-error hover:bg-error/10 px-3">
              <XCircle size={13} /> Decline
            </Button>
            <Button size="sm" onClick={() => onStart(delivery)}
              className="h-9 rounded-xl text-xs font-black gap-1.5 text-white px-4 shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
              <Truck size={13} /> Start
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── DeliveryTable ────────────────────────────────────────────────────────────

const DeliveryTable = ({ search }: { search: string }) => {
  const [data, setData]               = useState<AvailableDelivery[]>([]);
  const [loading, setLoading]         = useState(true);
  const [starting, setStarting]       = useState(false);
  const [declining, setDeclining]     = useState(false);
  const [selected, setSelected]       = useState<AvailableDelivery | null>(null);
  const [startOpen, setStartOpen]     = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("laundrix_token");
      const res   = await axios.get("/api/delivery-agent/available-deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const filtered = useMemo(() =>
    data.filter((item) =>
      !declinedIds.has(item.id) &&
      (item.orderId.toString().includes(search) ||
        item.customerName?.toLowerCase().includes(search.toLowerCase()))
    ), [data, search, declinedIds]);

  const handleStart   = (d: AvailableDelivery) => { setSelected(d); setStartOpen(true);   };
  const handleDecline = (d: AvailableDelivery) => { setSelected(d); setDeclineOpen(true); };

  const handleConfirmStart = async () => {
    if (!selected) return;
    setStarting(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      await axios.patch(`/api/delivery-agent/accept-delivery/${selected.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Delivery started successfully");
      setStartOpen(false); setSelected(null);
      await fetchDeliveries();
    } catch { toast.error("Failed to start delivery"); }
    finally { setStarting(false); }
  };

  const handleConfirmDecline = async () => {
    if (!selected) return;
    setDeclining(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      await axios.patch(`/api/delivery-agent/decline-delivery/${selected.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeclinedIds((prev) => new Set(prev).add(selected.id));
      toast.success("Delivery declined — returned to queue");
      setDeclineOpen(false); setSelected(null);
      await fetchDeliveries();
    } catch { toast.error("Failed to decline delivery"); }
    finally { setDeclining(false); }
  };

  if (loading) return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <Loading />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
        style={{ color: "var(--primary)" }}>
        <Inbox size={38} />
      </div>
      <p className="text-base font-black text-card-foreground">No deliveries available</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
        {search
          ? "No results match your search. Try a different keyword."
          : "New delivery assignments will appear here once assigned to you."}
      </p>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {filtered.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            onStart={handleStart}
            onDecline={handleDecline}
          />
        ))}
      </div>

      <StartConfirmDialog
        delivery={selected} open={startOpen}
        onClose={() => { setStartOpen(false); setSelected(null); }}
        onConfirm={handleConfirmStart} loading={starting}
      />
      <DeclineConfirmDialog
        delivery={selected} open={declineOpen}
        onClose={() => { setDeclineOpen(false); setSelected(null); }}
        onConfirm={handleConfirmDecline} loading={declining}
      />
    </>
  );
};

export default DeliveryTable;
