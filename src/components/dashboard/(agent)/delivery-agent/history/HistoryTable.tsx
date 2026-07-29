"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Truck, PackageCheck, User, Phone, Building2,
  Calendar, CheckCircle2, Clock, XCircle,
  CreditCard, Inbox, TrendingUp,
} from "lucide-react";
import { History } from "../types";
import Loading from "../Loading";

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { cls: string; dot: string; Icon: React.ElementType }> = {
  COMPLETED:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  CANCELLED:   { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400",    Icon: XCircle      },
  IN_PROGRESS: { cls: "bg-indigo-50  text-indigo-700  border-indigo-200",  dot: "bg-indigo-500",  Icon: Clock        },
  PENDING:     { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400",   Icon: Clock        },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400", Icon: Clock };
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
}

// ─── Payment pill ─────────────────────────────────────────────────────────────

const PAYMENT: Record<string, string> = {
  PAID:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  UNPAID:  "bg-rose-50    text-rose-700    border-rose-200",
  PENDING: "bg-amber-50   text-amber-700   border-amber-200",
};

function PaymentPill({ status }: { status: string }) {
  const cls = PAYMENT[status?.toUpperCase()] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${cls}`}>
      <CreditCard size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
}

// ─── HistoryCard ──────────────────────────────────────────────────────────────

function HistoryCard({ item }: { item: History }) {
  const isPickup = item.serviceType?.toUpperCase().includes("PICKUP");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-violet-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Type icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isPickup ? "bg-amber-50" : "bg-indigo-50"}`}>
          {isPickup
            ? <PackageCheck size={20} className="text-amber-500" />
            : <Truck size={20} className="text-indigo-500" />}
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-w-0">
          {/* Row 1: order + status + payment */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 font-mono">
              #{item.orderId}
            </span>
            <StatusPill status={item.status} />
            <PaymentPill status={item.paymentStatus} />
          </div>

          {/* Row 2: customer + phone + branch */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-semibold text-slate-700">{item.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />
              {item.customerPhone}
            </span>
            {item.branch && (
              <span className="flex items-center gap-1">
                <Building2 size={11} />
                {item.branch}
              </span>
            )}
            {item.serviceType && (
              <span className="flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {item.serviceType}
              </span>
            )}
          </div>

          {/* Row 3: completed date */}
          {item.completedAt && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar size={11} />
              Completed{" "}
              <span className="font-semibold text-slate-600">
                {new Date(item.completedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: amount */}
      <div className="shrink-0 self-start sm:self-center text-right">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</p>
        <p className="text-xl font-extrabold text-slate-900 leading-tight">
          ৳{(item.amount ?? 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── HistoryTable ─────────────────────────────────────────────────────────────

const HistoryTable = ({ search }: { search: string }) => {
  const [historyData, setHistoryData] = useState<History[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("laundrix_token");
        const res   = await axios.get("/api/delivery-agent/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistoryData(res.data.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = useMemo(() =>
    historyData.filter((item) =>
      item.orderId.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase())
    ), [historyData, search]);

  if (loading) return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <Loading />
    </div>
  );

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50">
        <Inbox size={38} className="text-violet-300" />
      </div>
      <p className="text-base font-bold text-slate-800">No history found</p>
      <p className="mt-2 max-w-xs text-sm text-slate-400">
        {search
          ? "No results match your search. Try a different keyword."
          : "Completed pickups and deliveries will appear here."}
      </p>
    </div>
  );

  // summary stats — always from full data, not filtered
  const totalAmount = historyData.reduce((s, h) => s + (h.amount ?? 0), 0);
  const completed   = historyData.filter((h) => h.status?.toUpperCase() === "COMPLETED").length;

  return (
    <div className="space-y-5">

      {/* ── Summary strip — always visible ────────────────────────────────── */}
      {historyData.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Tasks",  value: filtered.length, Icon: Truck,        iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100"  },
            { label: "Completed",    value: completed,        Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
            { label: "Total Earned", value: `৳${totalAmount.toLocaleString()}`, Icon: TrendingUp, iconBg: "bg-indigo-50", iconColor: "text-indigo-600", ringColor: "ring-indigo-100" },
          ].map(({ label, value, Icon, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <HistoryCard key={item.deliveryId} item={item} />
        ))}
      </div>
    </div>
  );
};

export default HistoryTable;
