"use client";

import { useMemo } from "react";
import {
  Clock, Ruler, PackageCheck,
  Inbox, ArrowRight, Navigation, Phone, ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { cls: string; dot: string }> = {
  ACTIVE:    { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success animate-pulse" },
  PENDING:   { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning"               },
  COMPLETED: { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary"               },
  CANCELLED: { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error"                 },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status?.toUpperCase()] ?? {
    cls: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── RouteCard ────────────────────────────────────────────────────────────────

function RouteCard({ route, index }: { route: any; index: number }) {
  const destLat = route.latitude;
  const destLng = route.longitude;
  const destinationParam = (destLat && destLng)
    ? `${destLat},${destLng}`
    : encodeURIComponent(route.endLocation || route.routeName || "Dhaka, Bangladesh");
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationParam}&travelmode=driving`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:border-ring/40 hover:shadow-md transition-all duration-200"
    >
      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Stop number */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-black text-base"
          style={{ color: "var(--primary)" }}>
          {index + 1}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-card-foreground">
              {route.routeName || `Route Stop #${index + 1}`}
            </p>
            <StatusPill status={route.status || "ACTIVE"} />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>{route.startLocation || "Branch Facility Hub"}</span>
            <ArrowRight size={12} className="text-muted-foreground/40" />
            <span className="font-black text-card-foreground">
              {route.endLocation || "Customer Address"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs font-black text-card-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={13} style={{ color: "var(--primary)" }} />
              {route.estimatedTime || "15 mins"}
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={13} style={{ color: "var(--secondary)" }} />
              {route.totalDistance || "3.2 km"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <PackageCheck size={13} className="text-success" />
              {route.totalStops || 1} Stop
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        {route.phone && (
          <a
            href={`tel:${route.phone}`}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 border border-success/25 hover:bg-success/20 transition-colors"
            style={{ color: "var(--success)" }}
            title="Call Customer"
          >
            <Phone size={16} />
          </a>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          <Navigation size={14} /> Start GPS Navigation <ExternalLink size={11} />
        </a>
      </div>
    </motion.div>
  );
}

// ─── RouteTable ───────────────────────────────────────────────────────────────

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

  if (loading) return (
    <div className="p-8 text-center text-xs font-black text-muted-foreground bg-card rounded-3xl border border-border animate-pulse">
      Loading optimized navigation routes…
    </div>
  );

  if (filtered.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10"
        style={{ color: "var(--primary)" }}>
        <Inbox size={32} />
      </div>
      <p className="text-sm font-black text-card-foreground">No active routes found</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground font-medium">
        {search
          ? "No routes match your search."
          : "Optimized routes will appear here once assigned to your zone."}
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
