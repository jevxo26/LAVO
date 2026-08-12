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
import { motion } from "framer-motion";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { cls: string; Icon: React.ElementType }> = {
  COMPLETED:   { cls: "bg-success/10 text-success border-success/25", Icon: CheckCircle2 },
  CANCELLED:   { cls: "bg-error/10 text-error border-error/25",       Icon: XCircle      },
  IN_PROGRESS: { cls: "bg-primary/10 text-primary border-primary/25", Icon: Clock        },
  PENDING:     { cls: "bg-warning/10 text-warning border-warning/25", Icon: Clock        },
};

function StatusPill({ status }: { status: string }) {
  const s    = STATUS[status?.toUpperCase()] ?? { cls: "bg-muted text-muted-foreground border-border", Icon: Clock };
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
}

// ─── Payment pill ─────────────────────────────────────────────────────────────

const PAYMENT: Record<string, string> = {
  PAID:    "bg-success/10 text-success border-success/25",
  UNPAID:  "bg-error/10 text-error border-error/25",
  PENDING: "bg-warning/10 text-warning border-warning/25",
};

function PaymentPill({ status }: { status: string }) {
  const cls = PAYMENT[status?.toUpperCase()] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cls}`}>
      <CreditCard size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
}

// ─── HistoryCard ──────────────────────────────────────────────────────────────

function HistoryCard({ item }: { item: History }) {
  const isPickup = item.serviceType?.toUpperCase().includes("PICKUP");

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:border-ring/40 hover:shadow-md transition-all duration-200"
    >
      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Type icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          isPickup ? "bg-warning/10" : "bg-primary/10"
        }`} style={{ color: isPickup ? "var(--warning)" : "var(--primary)" }}>
          {isPickup ? <PackageCheck size={20} /> : <Truck size={20} />}
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-w-0">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black text-card-foreground font-mono">#{item.orderId}</span>
            <StatusPill  status={item.status}        />
            <PaymentPill status={item.paymentStatus} />
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-black text-card-foreground">{item.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />{item.customerPhone}
            </span>
            {item.branch && (
              <span className="flex items-center gap-1">
                <Building2 size={11} />
                {typeof item.branch === "string"
                  ? item.branch
                  : ((item.branch as any)?.branchName || (item.branch as any)?.name || "")}
              </span>
            )}
            {item.serviceType && (
              <span className="rounded-lg border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {item.serviceType}
              </span>
            )}
          </div>

          {/* Row 3: completed date */}
          {item.completedAt && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar size={11} />
              Completed{" "}
              <span className="font-black text-card-foreground ml-0.5">
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
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Amount</p>
        <p className="text-xl font-black text-card-foreground leading-tight">
          ৳{(item.amount ?? 0).toLocaleString()}
        </p>
      </div>
    </motion.div>
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
      <p className="text-base font-black text-card-foreground">No history found</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
        {search
          ? "No results match your search. Try a different keyword."
          : "Completed pickups and deliveries will appear here."}
      </p>
    </div>
  );

  const totalAmount = historyData.reduce((s, h) => s + (h.amount ?? 0), 0);
  const completed   = historyData.filter((h) => h.status?.toUpperCase() === "COMPLETED").length;

  return (
    <div className="space-y-5">

      {/* ── Summary stat cards ──────────────────────────────────────────────── */}
      {historyData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OverviewStatCard label="Total Tasks"  sub="All time"          value={filtered.length}                   icon={Truck}        gradient="from-indigo-500 to-violet-600"  />
          <OverviewStatCard label="Completed"    sub="Successfully done" value={completed}                         icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"   />
          <OverviewStatCard label="Total Earned" sub="Cumulative amount" value={`৳${totalAmount.toLocaleString()}`} icon={TrendingUp}   gradient="from-blue-500 to-indigo-600"    />
        </div>
      )}

      {/* ── History cards ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <HistoryCard key={item.deliveryId} item={item} />
        ))}
      </div>
    </div>
  );
};

export default HistoryTable;
