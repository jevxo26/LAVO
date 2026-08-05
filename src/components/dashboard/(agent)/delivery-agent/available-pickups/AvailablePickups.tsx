"use client";

import { useMemo, useState } from "react";
import { Sparkles, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PickupTable from "./PickupTable";
import { motion } from "framer-motion";

const AvailablePickups = () => {
  const [search, setSearch] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-blue-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-300" />
            <span className="text-cyan-200 text-xs font-black uppercase tracking-widest">
              Delivery Agent Dispatch
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">Available Pickups</h1>
          <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
            View and accept all pending laundry pickup requests assigned to your route zone.
          </p>
        </div>
      </div>

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 px-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-rose-600 gap-1.5">
              <RotateCcw size={13} /> Clear Search
            </Button>
          )}
        </div>
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      <PickupTable search={search} />

    </motion.div>
  );
};

export default AvailablePickups;
