"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Route, MapPin, Sparkles, Navigation } from "lucide-react";
import RouteToolbar from "./RouteToolbar";
import RouteTable from "./RouteTable";
import { OptimizedRoute } from "../types";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

const OptimizeRoute = () => {
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem("laundrix_token");
        const res = await axios.get("/api/delivery-agent/optimized-routes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoutes(res.data.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const totalStops    = routes.reduce((s, r) => s + (r.totalStops ?? 0), 0);
  const totalPickups  = routes.reduce((s, r) => s + (r.pickups ?? 0), 0);
  const totalDeliveries = routes.reduce((s, r) => s + (r.deliveries ?? 0), 0);

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-sky-200" />
              <span className="text-sky-200 text-[11px] font-semibold uppercase tracking-widest">Delivery Agent Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Optimized Routes</h1>
            <p className="mt-1 text-sm text-sky-100">System-generated route plan for efficient pickups and deliveries.</p>
          </div>
          {!loading && routes.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-sky-200 text-[10px] font-semibold uppercase tracking-wider">Routes</p>
                <p className="text-white font-extrabold text-xl leading-tight">{routes.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-sky-200 text-[10px] font-semibold uppercase tracking-wider">Total Stops</p>
                <p className="text-white font-extrabold text-xl leading-tight">{totalStops}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat chips ────────────────────────────────────────────────────── */}
      {!loading && routes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Routes",   sub: "Active today",     value: routes.length,    Icon: Route,    iconBg: "bg-sky-50",     iconColor: "text-sky-600",     ringColor: "ring-sky-100"     },
            { label: "Pickups",        sub: "To collect",       value: totalPickups,     Icon: MapPin,   iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
            { label: "Deliveries",     sub: "To drop off",      value: totalDeliveries,  Icon: Navigation, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
          ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
            <MapPin size={14} className="text-sky-500" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Route Map</h2>
            <p className="text-[11px] text-slate-400">Live route visualization · LAVO Branch → Customer stops</p>
          </div>
          {!loading && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <div className="p-4">
          {loading ? (
            <Sk className="h-[400px] w-full rounded-xl" />
          ) : (
            <div className="rounded-xl overflow-hidden ring-1 ring-slate-100">
              <RouteMap routes={routes} />
            </div>
          )}
        </div>
      </div>

      {/* ── Route table ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Route size={14} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Route Details</h2>
            <p className="text-[11px] text-slate-400">All stops, distances, and estimated times</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <RouteToolbar search={search} setSearch={setSearch} />
          <RouteTable search={search} routes={routes} />
        </div>
      </div>

    </div>
  );
};

export default OptimizeRoute;
