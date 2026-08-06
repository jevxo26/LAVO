"use client";

import { useMemo } from "react";
import {
  Route, MapPin, Clock, Ruler, PackageCheck,
  Truck, CheckCircle2, Circle, Inbox, ArrowRight, Navigation, Phone, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS: Record<string, { cls: string; dot: string }> = {
  ACTIVE:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  PENDING:    { cls: "bg-amber-50   text-amber-700   border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",   dot: "bg-amber-400"  },
  COMPLETED:  { cls: "bg-blue-50    text-blue-700    border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",    dot: "bg-blue-500"   },
  CANCELLED:  { cls: "bg-rose-50    text-rose-700    border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",    dot: "bg-rose-400"   },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function RouteCard({ route, index }: { route: any; index: number }) {
  const destLat = route.latitude;
  const destLng = route.longitude;
  const destinationParam = (destLat && destLng)
    ? `${destLat},${destLng}`
    : encodeURIComponent(route.endLocation || route.routeName || "Dhaka, Bangladesh");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationParam}&travelmode=driving`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-black text-base dark:bg-blue-950/50 dark:text-blue-400">
          {index + 1}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-900 dark:text-white">{route.routeName || `Route Stop #${index + 1}`}</p>
            <StatusPill status={route.status || "ACTIVE"} />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{route.startLocation || "Branch Facility Hub"}</span>
            <ArrowRight size={12} className="text-slate-300 dark:text-slate-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{route.endLocation || "Customer Address"}</span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs font-black text-slate-600 dark:text-slate-300 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-blue-500" /> {route.estimatedTime || "15 mins"}
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={13} className="text-cyan-500" /> {route.totalDistance || "3.2 km"}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <PackageCheck size={13} className="text-emerald-500" /> {route.totalStops || 1} Stop
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        {route.phone && (
          <a
            href={`tel:${route.phone}`}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/50 dark:border-emerald-900/60 dark:text-emerald-400"
            title="Call Customer"
          >
            <Phone size={16} />
          </a>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
        >
          <Navigation size={15} /> Start GPS Navigation <ExternalLink size={12} />
        </a>
      </div>
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
      <div className="p-8 text-center text-xs font-black text-slate-400 bg-white rounded-3xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
        Loading optimized navigation routes...
      </div>
    );
  }

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center dark:bg-slate-900 dark:border-slate-800">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-500 dark:bg-blue-950/50">
        <Inbox size={32} className="text-blue-400" />
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white">No active routes found</p>
      <p className="mt-1 max-w-xs text-xs text-slate-400 font-medium">
        {search ? "No routes match your search." : "Optimized routes will appear here once assigned to your zone."}
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
