"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PackageCheck, User, Phone, MapPin, Ruler,
  Store, Building2, Shirt, CheckCircle2,
  Clock, Inbox, Loader2, XCircle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AvailablePickup } from "../types";
import { toast } from "@/lib/toast";
import Loading from "../Loading";
import { motion } from "framer-motion";

// ─── Priority pill ────────────────────────────────────────────────────────────

const PRIORITY: Record<string, { cls: string; dot: string }> = {
  HIGH:   { cls: "bg-error/10 text-error border-error/25",     dot: "bg-error"   },
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

// ─── Accept confirm dialog ────────────────────────────────────────────────────

function AcceptConfirmDialog({ pickup, open, onClose, onConfirm, loading }: {
  pickup: AvailablePickup | null; open: boolean;
  onClose: () => void; onConfirm: () => Promise<void>; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-3xl border border-border bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10"
            style={{ color: "var(--warning)" }}>
            <PackageCheck size={22} />
          </div>
          <DialogTitle className="text-center text-base font-black text-card-foreground">Accept Pickup</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Confirm you want to accept this pickup request.
          </DialogDescription>
        </DialogHeader>

        {pickup && (
          <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 space-y-2 text-xs">
            {[
              { label: "Order ID",  value: `#${pickup.orderId}`, mono: true },
              { label: "Customer",  value: pickup.customerName               },
              { label: "Garments",  value: `${pickup.totalGarments ?? 1} item(s)`, primary: true },
              { label: "Distance",  value: pickup.distance                   },
            ].map(({ label, value, mono, primary }) => value && (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className={`font-black ${mono ? "font-mono text-card-foreground" : primary ? "" : "text-card-foreground"}`}
                  style={primary ? { color: "var(--primary)" } : undefined}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10 font-bold">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl h-10 font-black gap-1.5 text-white"
            style={{ background: "var(--warning)" }}>
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Accepting…</>
              : <><CheckCircle2 size={14} /> Accept Pickup</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Decline confirm dialog ───────────────────────────────────────────────────

function DeclineConfirmDialog({ pickup, open, onClose, onConfirm, loading }: {
  pickup: AvailablePickup | null; open: boolean;
  onClose: () => void; onConfirm: () => Promise<void>; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-3xl border border-border bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertTriangle size={22} />
          </div>
          <DialogTitle className="text-center text-base font-black text-card-foreground">Decline Pickup</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            This pickup will be returned to the queue for another agent to accept.
          </DialogDescription>
        </DialogHeader>

        {pickup && (
          <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Order ID</span>
              <span className="font-black font-mono text-card-foreground">#{pickup.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Customer</span>
              <span className="font-bold text-card-foreground">{pickup.customerName}</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10 font-bold">
            Go Back
          </Button>
          <Button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl h-10 font-black gap-1.5 text-white"
            style={{ background: "var(--error)" }}>
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Declining…</>
              : <><XCircle size={14} /> Decline Pickup</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── PickupCard ───────────────────────────────────────────────────────────────

function PickupCard({ pickup, onAccept, onDecline }: {
  pickup: AvailablePickup;
  onAccept:  (p: AvailablePickup) => void;
  onDecline: (p: AvailablePickup) => void;
}) {
  const isAccepted = pickup.status === "IN_PROGRESS" || pickup.status === "ACCEPTED";
  const dest       = pickup.dropoffDestination;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-card p-5 shadow-sm transition-all duration-200 ${
        isAccepted ? "border-success/25 hover:border-success/40" : "border-border hover:border-warning/40 hover:shadow-md"
      }`}
    >
      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/10"
          style={{ color: "var(--warning)" }}>
          <PackageCheck size={20} />
        </div>

        <div className="space-y-1.5 min-w-0">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black text-card-foreground font-mono">#{pickup.orderId}</span>
            <StatusPill status={pickup.status} />
            {pickup.priority && <PriorityPill priority={pickup.priority} />}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-black text-card-foreground">{pickup.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />{pickup.customerPhone}
            </span>
            <span className="flex items-center gap-1">
              <Shirt size={11} />
              <span className="font-black" style={{ color: "var(--primary)" }}>{pickup.totalGarments ?? 1} garment(s)</span>
            </span>
            {pickup.distance && pickup.distance !== "N/A" && (
              <span className="flex items-center gap-1">
                <Ruler size={11} />
                <span className="font-black" style={{ color: "var(--secondary)" }}>{pickup.distance}</span>
              </span>
            )}
          </div>

          {/* Row 3 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {pickup.pickupAddress && (
              <span className="flex items-center gap-1 max-w-[240px] truncate">
                <MapPin size={11} className="shrink-0" />{pickup.pickupAddress}
              </span>
            )}
            {dest && (
              <span className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-black ${
                dest.isVendor
                  ? "bg-secondary/10 text-secondary border-secondary/25"
                  : "bg-primary/10 border-primary/20"
              }`} style={!dest.isVendor ? { color: "var(--primary)" } : undefined}>
                {dest.isVendor ? <Store size={10} /> : <Building2 size={10} />}
                {dest.isVendor
                  ? `Vendor: ${dest.name}`
                  : `Hub: ${dest.name || (typeof pickup.branch === "string" ? pickup.branch : ((pickup.branch as any)?.branchName || (pickup.branch as any)?.name || ""))}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="shrink-0 self-start sm:self-center">
        {isAccepted ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-[11px] font-black text-success">
            <CheckCircle2 size={13} /> Accepted
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onDecline(pickup)}
              className="h-9 rounded-xl text-xs font-black gap-1.5 border-error/25 text-error hover:bg-error/10 px-3">
              <XCircle size={13} /> Decline
            </Button>
            <Button size="sm" onClick={() => onAccept(pickup)}
              className="h-9 rounded-xl text-xs font-black gap-1.5 text-white px-4 shadow-sm"
              style={{ background: "var(--warning)" }}>
              <PackageCheck size={13} /> Accept
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── PickupTable ──────────────────────────────────────────────────────────────

const PickupTable = ({ search }: { search: string }) => {
  const [data, setData]               = useState<AvailablePickup[]>([]);
  const [loading, setLoading]         = useState(true);
  const [accepting, setAccepting]     = useState(false);
  const [declining, setDeclining]     = useState(false);
  const [selected, setSelected]       = useState<AvailablePickup | null>(null);
  const [acceptOpen, setAcceptOpen]   = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("laundrix_token");
      const res   = await axios.get("/api/delivery-agent/available-pickups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data ?? []);
    } catch (error) {
      console.error("Pickup fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPickups(); }, []);

  const filtered = useMemo(() =>
    data.filter((item) =>
      !declinedIds.has(item.id) &&
      (item.orderId.toString().includes(search) ||
        item.customerName?.toLowerCase().includes(search.toLowerCase()))
    ), [data, search, declinedIds]);

  const handleAccept  = (p: AvailablePickup) => { setSelected(p); setAcceptOpen(true);  };
  const handleDecline = (p: AvailablePickup) => { setSelected(p); setDeclineOpen(true); };

  const handleConfirmAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      await axios.patch(`/api/delivery-agent/accept-pickup/${selected.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Pickup accepted successfully");
      setAcceptOpen(false); setSelected(null);
      await fetchPickups();
    } catch { toast.error("Failed to accept pickup"); }
    finally { setAccepting(false); }
  };

  const handleConfirmDecline = async () => {
    if (!selected) return;
    setDeclining(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      await axios.patch(`/api/delivery-agent/decline-pickup/${selected.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeclinedIds((prev) => new Set(prev).add(selected.id));
      toast.success("Pickup declined — returned to queue");
      setDeclineOpen(false); setSelected(null);
      await fetchPickups();
    } catch { toast.error("Failed to decline pickup"); }
    finally { setDeclining(false); }
  };

  if (loading) return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <Loading />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-warning/10"
        style={{ color: "var(--warning)" }}>
        <Inbox size={38} />
      </div>
      <p className="text-base font-black text-card-foreground">No pickups available</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
        {search
          ? "No results match your search. Try a different keyword."
          : "New pickup requests will appear here once assigned to your zone."}
      </p>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {filtered.map((pickup) => (
          <PickupCard key={pickup.id} pickup={pickup} onAccept={handleAccept} onDecline={handleDecline} />
        ))}
      </div>

      <AcceptConfirmDialog
        pickup={selected} open={acceptOpen}
        onClose={() => { setAcceptOpen(false); setSelected(null); }}
        onConfirm={handleConfirmAccept} loading={accepting}
      />
      <DeclineConfirmDialog
        pickup={selected} open={declineOpen}
        onClose={() => { setDeclineOpen(false); setSelected(null); }}
        onConfirm={handleConfirmDecline} loading={declining}
      />
    </>
  );
};

export default PickupTable;
