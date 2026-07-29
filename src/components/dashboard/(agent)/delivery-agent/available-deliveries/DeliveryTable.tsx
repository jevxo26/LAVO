"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Truck, User, Phone, MapPin, Ruler,
  Shirt, Store, Building2, CreditCard,
  Weight, Package, CheckCircle2, Inbox, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AvailableDelivery } from "../types";
import { toast } from "@/lib/toast";
import Loading from "../Loading";

// ─── Priority pill ────────────────────────────────────────────────────────────

const PRIORITY: Record<string, { cls: string; dot: string }> = {
  HIGH:   { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400"    },
  MEDIUM: { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400"   },
  LOW:    { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500"  },
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
  PENDING:     { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400"   },
  ACCEPTED:    { cls: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500"    },
  IN_PROGRESS: { cls: "bg-indigo-50  text-indigo-700  border-indigo-200",  dot: "bg-indigo-500"  },
  COMPLETED:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED:   { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400"    },
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

// ─── Start confirm dialog ─────────────────────────────────────────────────────

function StartConfirmDialog({ delivery, open, onClose, onConfirm, loading }: {
  delivery: AvailableDelivery | null;
  open: boolean; onClose: () => void;
  onConfirm: () => Promise<void>; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Truck size={22} className="text-indigo-500" />
          </div>
          <DialogTitle className="text-center text-base font-extrabold text-slate-900">
            Start Delivery
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            Confirm you want to start the drop-off delivery.
          </DialogDescription>
        </DialogHeader>

        {delivery && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Order ID</span>
              <span className="font-bold text-slate-900 font-mono">#{delivery.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Customer</span>
              <span className="font-semibold text-slate-700">{delivery.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Garments</span>
              <span className="font-semibold text-indigo-600">{delivery.totalGarments ?? 1} item(s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Distance</span>
              <span className="font-semibold text-slate-700">{delivery.distance}</span>
            </div>
            {delivery.codAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">COD Amount</span>
                <span className="font-bold text-emerald-600">৳{delivery.codAmount}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl font-bold">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Starting…</>
              : <><Truck size={14} /> Start Delivery</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DeliveryCard ─────────────────────────────────────────────────────────────

function DeliveryCard({ delivery, onStart }: {
  delivery: AvailableDelivery;
  onStart: (d: AvailableDelivery) => void;
}) {
  const isStarted = delivery.status === "IN_PROGRESS" || delivery.status === "ACCEPTED";
  const src       = delivery.pickupSource;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200
      ${isStarted
        ? "border-indigo-100 hover:border-indigo-200"
        : "border-slate-100 hover:border-indigo-200 hover:shadow-md"}`}>

      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
          <Truck size={20} className="text-indigo-500" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-w-0">
          {/* Row 1: order + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 font-mono">
              #{delivery.orderId}
            </span>
            <StatusPill status={delivery.status} />
            {delivery.priority && <PriorityPill priority={delivery.priority} />}
          </div>

          {/* Row 2: customer + phone + garments + distance */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-semibold text-slate-700">{delivery.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />
              {delivery.customerPhone}
            </span>
            <span className="flex items-center gap-1">
              <Shirt size={11} />
              <span className="font-semibold text-indigo-600">{delivery.totalGarments ?? 1} garment(s)</span>
            </span>
            {delivery.distance && (
              <span className="flex items-center gap-1">
                <Ruler size={11} />
                <span className="font-semibold text-violet-600">{delivery.distance}</span>
              </span>
            )}
          </div>

          {/* Row 3: address + source hub + payment meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            {delivery.deliveryAddress && (
              <span className="flex items-center gap-1 max-w-[220px] truncate">
                <MapPin size={11} className="shrink-0" />
                {delivery.deliveryAddress}
              </span>
            )}
            {src && (
              <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold
                ${src.isVendor
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                {src.isVendor ? <Store size={10} /> : <Building2 size={10} />}
                {src.isVendor ? `From Vendor: ${src.name}` : `From Hub: ${src.name || delivery.branch}`}
              </span>
            )}
            {delivery.parcelType && (
              <span className="flex items-center gap-1">
                <Package size={11} />
                {delivery.parcelType}
              </span>
            )}
            {delivery.weight && (
              <span className="flex items-center gap-1">
                <Weight size={11} />
                {delivery.weight}
              </span>
            )}
            {delivery.paymentType && (
              <span className="flex items-center gap-1">
                <CreditCard size={11} />
                {delivery.paymentType}
                {delivery.codAmount > 0 && (
                  <span className="ml-0.5 font-bold text-emerald-600">৳{delivery.codAmount}</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: action */}
      <div className="shrink-0 self-start sm:self-center">
        {isStarted ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700">
            <CheckCircle2 size={13} /> In Progress
          </div>
        ) : (
          <Button size="sm" onClick={() => onStart(delivery)}
            className="h-9 rounded-xl text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 px-4">
            <Truck size={13} /> Start
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── DeliveryTable ────────────────────────────────────────────────────────────

const DeliveryTable = ({ search }: { search: string }) => {
  const [data, setData]           = useState<AvailableDelivery[]>([]);
  const [loading, setLoading]     = useState(true);
  const [starting, setStarting]   = useState(false);
  const [selected, setSelected]   = useState<AvailableDelivery | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      item.orderId.toString().includes(search) ||
      item.customerName?.toLowerCase().includes(search.toLowerCase())
    ), [data, search]);

  const handleStart   = (d: AvailableDelivery) => { setSelected(d); setConfirmOpen(true); };
  const handleConfirm = async () => {
    if (!selected) return;
    setStarting(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      await axios.patch(`/api/delivery-agent/accept-delivery/${selected.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Delivery started successfully");
      setConfirmOpen(false);
      setSelected(null);
      await fetchDeliveries();
    } catch (error) {
      toast.error("Failed to start delivery");
    } finally {
      setStarting(false);
    }
  };

  if (loading) return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <Loading />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
        <Inbox size={38} className="text-indigo-300" />
      </div>
      <p className="text-base font-bold text-slate-800">No deliveries available</p>
      <p className="mt-2 max-w-xs text-sm text-slate-400">
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
          <DeliveryCard key={delivery.id} delivery={delivery} onStart={handleStart} />
        ))}
      </div>

      <StartConfirmDialog
        delivery={selected}
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelected(null); }}
        onConfirm={handleConfirm}
        loading={starting}
      />
    </>
  );
};

export default DeliveryTable;
