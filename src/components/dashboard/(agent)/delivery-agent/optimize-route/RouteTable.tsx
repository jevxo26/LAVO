"use client";

import { useMemo } from "react";
import {
  Route, MapPin, Clock, Ruler, PackageCheck,
  Truck, CheckCircle2, Circle, Inbox, ArrowRight,
} from "lucide-react";
import { OptimizedRoute } from "../types";

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

function RouteCard({ route, index }: { route: any; index: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 font-extrabold text-sm">
          {index + 1}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-800">{route.routeName || `Route #${index + 1}`}</p>
            <StatusPill status={route.status || "ACTIVE"} />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{route.startLocation || "Branch Hub"}</span>
            <ArrowRight size={12} className="text-slate-300" />
            <span>{route.endLocation || "Destination"}</span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-sky-500" /> {route.estimatedTime || "15 mins"}
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={13} className="text-purple-500" /> {route.totalDistance || "3.2 km"}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <PackageCheck size={13} className="text-emerald-500" /> {route.totalStops || 2} Stops
            </span>
          </div>
        </div>
      </div>

      {route.status?.toUpperCase() === "COMPLETED" && (
        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 shrink-0 self-start sm:self-center">
          <CheckCircle2 size={13} /> Completed
        </div>
      )}
    </div>
  );
}

type Props = { search: string; routes: any[]; loading?: boolean; setSearch?: any };

const RouteTable = ({ search, routes, loading }: Props) => {
  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();
    return routes.filter((r) =>
      (r.routeName || "").toLowerCase().includes(q) ||
      (r.startLocation || "").toLowerCase().includes(q) ||
      (r.endLocation || "").toLowerCase().includes(q)
    );
  }, [routes, search]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-slate-500 bg-white rounded-2xl border border-slate-100">
        Loading routes...
      </div>
    );
  }

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
        <RouteCard key={route.id || index} route={route} index={index} />
      ))}
    </div>
  );
};

export default RouteTable;
