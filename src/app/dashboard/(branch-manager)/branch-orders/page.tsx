"use client";

import React, { useEffect, useState } from "react";
import {
  Package, AlertTriangle, ArrowRight, RefreshCw,
  Sparkles, Search, RotateCcw, Inbox,
  User, Calendar, Banknote, Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import io from "socket.io-client";
import { OrderActions } from "./OrderActions";

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { cls: string; dot: string }> = {
  PENDING:              { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400"   },
  CONFIRMED:            { cls: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500"    },
  PROCESSING:           { cls: "bg-indigo-50  text-indigo-700  border-indigo-200",  dot: "bg-indigo-500"  },
  WASHING:              { cls: "bg-cyan-50    text-cyan-700    border-cyan-200",    dot: "bg-cyan-500"    },
  READY_FOR_DELIVERY:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  COMPLETED:            { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED:            { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400"    },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_META[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchOrders() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const fetchOrders = () => {
    fetch("/api/branch-dashboard/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("laundrix_token")}` },
    })
      .then((res) => res.json())
      .then((res) => { setOrders(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
    socket.emit("joinBranch", "current_branch_id_mock");
    socket.on("garmentStatusUpdated", fetchOrders);
    socket.on("orderStatusUpdated", fetchOrders);
    return () => { socket.disconnect(); };
  }, []);

  const filtered = orders.filter((o) =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const isOverflow = orders.length > 5;

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Branch Manager Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Active Orders</h1>
            <p className="mt-1 text-sm text-indigo-200">Manage laundry orders currently in the facility.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Total</p>
              <p className="text-white font-extrabold text-xl leading-tight">{orders.length}</p>
            </div>
            <Button onClick={fetchOrders}
              className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 shadow-sm gap-1.5">
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── Overflow alert ──────────────────────────────────────────────── */}
      {isOverflow && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">High Order Volume — {orders.length} Active Orders</p>
              <p className="text-xs text-amber-700 mt-0.5">Branch threshold of 5 orders exceeded. Delegate overflow to partner vendors.</p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button size="sm" className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shrink-0">
              View Partner Vendors <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      )}

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition" />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <p className="ml-auto text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600">{filtered.length}</span> orders
          </p>
        </div>
      </div>

      {/* ── Order list ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map((i) => <Sk key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <Inbox size={38} className="text-indigo-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No orders found</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            {search ? "Try a different search term." : "No active orders in the facility right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              {/* Left */}
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
                  <Package size={20} className="text-indigo-500" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-900 font-mono">#{order.orderNumber}</span>
                    <StatusPill status={order.orderStatus} />
                    {order.vendor && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        <Store size={9} /> {order.vendor.businessName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      <span className="font-semibold text-slate-700">{order.customer?.user?.fullName || "Unknown"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Banknote size={11} />
                      <span className="font-semibold text-slate-700">৳{order.grandTotal}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
              {/* Right: actions */}
              <div className="shrink-0 self-start sm:self-center">
                <OrderActions order={order} onUpdate={fetchOrders} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
