"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PackageCheck, User, Phone, MapPin, Ruler,
  Store, Building2, Shirt, Zap, CheckCircle2,
  Clock, Inbox, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AvailablePickup } from "../types";
import { toast } from "@/lib/toast";
import Loading from "../Loading";

// ─── Priority pill ────────────────────────────────────────────────────────────

const PRIORITY: Record<string, { cls: string; dot: string }> = {
  HIGH:   { cls: "bg-rose-50   text-rose-700   border-rose-200",   dot: "bg-rose-400"   },
  MEDIUM: { cls: "bg-amber-50  text-amber-700  border-amber-200",  dot: "bg-amber-400"  },
  LOW:    { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

function PriorityPill({ priority }: { priority: string }) {
  const s = PRIORITY[priority?.toUpperCase()] ?? PRIORITY.LOW;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {priority}
    </span>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { cls: string; dot: string }> = {
  PENDING:     { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"   },
  ACCEPTED:    { cls: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-500"    },
  IN_PROGRESS: { cls: "bg-indigo-50 text-indigo-700 border-indigo-200",   dot: "bg-indigo-500"  },
  COMPLETED:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED:   { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"    },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Accept confirm dialog ────────────────────────────────────────────────────

function AcceptConfirmDialog({
  pickup,
  open,
  onClose,
  onConfirm,
  loading,
}: {
  pickup: AvailablePickup | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <PackageCheck size={22} className="text-amber-500" />
          </div>
          <DialogTitle className="text-center text-base font-extrabold text-slate-900">
            Accept Pickup
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            Confirm you want to accept this pickup request.
          </DialogDescription>
        </DialogHeader>

        {pickup && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Order ID</span>
              <span className="font-bold text-slate-900 font-mono">#{pickup.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Customer</span>
              <span className="font-semibold text-slate-700">{pickup.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Garments</span>
              <span className="font-semibold text-indigo-600">{pickup.totalGarments ?? 1} item(s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Distance</span>
              <span className="font-semibold text-slate-700">{pickup.distance}</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl font-bold">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Accepting…</>
              : <><CheckCircle2 size={14} /> Accept Pickup</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── PickupCard ───────────────────────────────────────────────────────────────

function PickupCard({
  pickup,
  onAccept,
}: {
  pickup: AvailablePickup;
  onAccept: (p: AvailablePickup) => void;
}) {
  const isAccepted = pickup.status === "IN_PROGRESS" || pickup.status === "ACCEPTED";
  const dest       = pickup.dropoffDestination;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200
      ${isAccepted ? "border-emerald-100 hover:border-emerald-200" : "border-slate-100 hover:border-amber-200 hover:shadow-md"}`}>

      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
          <PackageCheck size={20} className="text-amber-500" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-w-0">
          {/* Row 1: order + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 font-mono">
              #{pickup.orderId}
            </span>
            <StatusPill status={pickup.status} />
            {pickup.priority && <PriorityPill priority={pickup.priority} />}
          </div>

          {/* Row 2: customer + phone + garments */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-semibold text-slate-700">{pickup.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />
              {pickup.customerPhone}
            </span>
            <span className="flex items-center gap-1">
              <Shirt size={11} />
              <span className="font-semibold text-indigo-600">{pickup.totalGarments ?? 1} garment(s)</span>
            </span>
            {pickup.distance && (
              <span className="flex items-center gap-1">
                <Ruler size={11} />
                <span className="font-semibold text-violet-600">{pickup.distance}</span>
              </span>
            )}
          </div>

          {/* Row 3: address + drop-off hub */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            {pickup.pickupAddress && (
              <span className="flex items-center gap-1 max-w-[240px] truncate">
                <MapPin size={11} className="shrink-0" />
                {pickup.pickupAddress}
              </span>
            )}
            {dest && (
              <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold
                ${dest.isVendor
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                {dest.isVendor ? <Store size={10} /> : <Building2 size={10} />}
                {dest.isVendor ? `Vendor: ${dest.name}` : `Hub: ${dest.name || pickup.branch}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: action */}
      <div className="shrink-0 self-start sm:self-center">
        {isAccepted ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={13} /> Accepted
          </div>
        ) : (
          <Button size="sm" onClick={() => onAccept(pickup)}
            className="h-9 rounded-xl text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 px-4">
            <PackageCheck size={13} /> Accept
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── PickupTable ──────────────────────────────────────────────────────────────

const PickupTable = ({ search }: { search: string }) => {
  const [data, setData]           = useState<AvailablePickup[]>([]);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [selected, setSelected]   = useState<AvailablePickup | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      item.orderId.toString().includes(search) ||
      item.customerName?.toLowerCase().includes(search.toLowerCase())
    ), [data, search]);

  const handleAccept = (pickup: AvailablePickup) => { setSelected(pickup); setConfirmOpen(true); };

  const handleConfirm = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      await axios.patch(`/api/delivery-agent/accept-pickup/${selected.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Pickup accepted successfully");
      setConfirmOpen(false);
      setSelected(null);
      await fetchPickups();
    } catch (error) {
      toast.error("Failed to accept pickup");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <Loading />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
        <Inbox size={38} className="text-amber-300" />
      </div>
      <p className="text-base font-bold text-slate-800">No pickups available</p>
      <p className="mt-2 max-w-xs text-sm text-slate-400">
        {search ? "No results match your search. Try a different keyword." : "New pickup requests will appear here once assigned to your zone."}
      </p>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {filtered.map((pickup) => (
          <PickupCard key={pickup.id} pickup={pickup} onAccept={handleAccept} />
        ))}
      </div>

      <AcceptConfirmDialog
        pickup={selected}
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelected(null); }}
        onConfirm={handleConfirm}
        loading={accepting}
      />
    </>
  );
};

export default PickupTable;
