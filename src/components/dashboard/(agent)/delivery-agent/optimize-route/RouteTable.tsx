"use client";

import { useMemo } from "react";
import {
  Route, MapPin, Clock, Ruler, PackageCheck,
  Truck, CheckCircle2, Circle, Inbox, ArrowRight,
} from "lucide-react";
import { OptimizedRoute } from "../types";

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { cls: string; dot: string }> = {
  ACTIVE:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  PENDING:    { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400"  },
  COMPLETED:  { cls: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500"   },
  CANCELLED:  { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400"   },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── RouteCard ────────────────────────────────────────────────────────────────

function RouteCard({ route, index }: { route: OptimizedRoute; index: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-200">

      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Step number */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 font-extrabold text-sm">
          {index + 1}
        </div>

        {/* Info */}
        <div className="space-y-1.5 min-w-0">
          {/* Row 1: name + status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900">{route.routeName}</span>
            <StatusPill status={route.status} />
          </div>

          {/* Row 2: start → end */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Circle size={9} className="text-sky-400 shrink-0" />
            <span className="font-semibold text-slate-700 truncate max-w-[120px]">{route.startLocation}</span>
            <ArrowRight size={11} className="text-slate-300 shrink-0" />
            <MapPin size={9} className="text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-700 truncate max-w-[120px]">{route.endLocation}</span>
          </div>

          {/* Row 3: meta chips */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              <span className="font-semibold text-slate-600">{route.totalStops} stops</span>
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={11} />
              <span className="font-semibold text-slate-600">{route.totalDistance}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              <span className="font-semibold text-slate-600">{route.estimatedTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <PackageCheck size={11} className="text-amber-500" />
              <span className="font-semibold text-amber-600">{route.pickups} pickups</span>
            </span>
            <span className="flex items-center gap-1">
              <Truck size={11} className="text-indigo-500" />
              <span className="font-semibold text-indigo-600">{route.deliveries} deliveries</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: completed badge */}
      {route.status?.toUpperCase() === "COMPLETED" && (
        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 shrink-0 self-start sm:self-center">
          <CheckCircle2 size={13} /> Completed
        </div>
      )}
    </div>
  );
}

// ─── RouteTable ───────────────────────────────────────────────────────────────

type Props = { search: string; routes: OptimizedRoute[] };

const RouteTable = ({ search, routes }: Props) => {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return routes.filter((r) =>
      r.routeName.toLowerCase().includes(q) ||
      r.startLocation.toLowerCase().includes(q) ||
      r.endLocation.toLowerCase().includes(q)
    );
  }, [routes, search]);

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50">
        <Inbox size={32} className="text-sky-300" />
      </div>
      <p className="text-sm font-bold text-slate-800">No routes found</p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">
        {search ? "No routes match your search." : "Optimized routes will appear here once assigned."}
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      {filtered.map((route, index) => (
        <RouteCard key={route.id} route={route} index={index} />
      ))}
    </div>
  );
};

export default RouteTable;
