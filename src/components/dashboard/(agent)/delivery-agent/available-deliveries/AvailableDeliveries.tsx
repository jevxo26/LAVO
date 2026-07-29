"use client";

import { useState } from "react";
import { Truck, Sparkles } from "lucide-react";
import DeliveryToolbar from "./DeliveryToolbar";
import DeliveryTable from "./DeliveryTable";

const AvailableDeliveries = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={13} className="text-indigo-200" />
            <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Delivery Agent Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Available Deliveries</h1>
          <p className="mt-1 text-sm text-indigo-200">View and start all pending delivery assignments in your area.</p>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <DeliveryToolbar search={search} setSearch={setSearch} />
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <DeliveryTable search={search} />

    </div>
  );
};

export default AvailableDeliveries;
