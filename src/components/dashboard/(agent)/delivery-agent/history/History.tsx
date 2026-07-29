"use client";

import { useState } from "react";
import { Sparkles, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryTable from "./HistoryTable";

const History = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={13} className="text-violet-200" />
            <span className="text-violet-200 text-[11px] font-semibold uppercase tracking-widest">
              Delivery Agent Portal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Delivery History</h1>
          <p className="mt-1 text-sm text-violet-100">
            View all completed pickups and deliveries with full details.
          </p>
        </div>
      </div>

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <HistoryTable search={search} />

    </div>
  );
};

export default History;
