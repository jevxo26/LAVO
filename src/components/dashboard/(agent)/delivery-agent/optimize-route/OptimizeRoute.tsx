"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  Route as RouteIcon, Navigation, LocateFixed,
  ExternalLink, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import RouteTable from "./RouteTable";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export const OptimizeRoute = () => {
  const [search, setSearch]           = useState("");
  const [routes, setRoutes]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus]     = useState<"IDLE" | "ACQUIRING" | "ACTIVE" | "ERROR">("IDLE");
  const [gpsErrorMsg, setGpsErrorMsg] = useState("");

  const requestGpsLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsStatus("ERROR");
      setGpsErrorMsg("Geolocation is not supported by your browser.");
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGpsStatus("ACQUIRING");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAgentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("ACTIVE");
        toast.success(`GPS Location Lock Acquired (${pos.coords.accuracy.toFixed(0)}m accuracy)`);
      },
      (err) => {
        setGpsStatus("ERROR");
        let msg = "Could not get your location. Please grant GPS permission in browser settings.";
        if (err.code === err.PERMISSION_DENIED)     msg = "GPS Location Permission Denied. Please enable location access.";
        else if (err.code === err.POSITION_UNAVAILABLE) msg = "GPS Signal Unavailable. Ensure location services are on.";
        else if (err.code === err.TIMEOUT)          msg = "GPS Location request timed out. Please try again.";
        setGpsErrorMsg(msg);
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, []);

  useEffect(() => {
    requestGpsLocation();
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => { setAgentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus("ACTIVE"); },
        (err) => console.warn("Agent Geolocation watch warning:", err?.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [requestGpsLocation]);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const token  = localStorage.getItem("laundrix_token");
        const params: Record<string, number> = {};
        if (agentLocation) { params.lat = agentLocation.lat; params.lon = agentLocation.lng; }
        const res = await axios.get("/api/delivery-agent/optimized-routes", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }).catch(() => ({ data: { data: [] } }));
        setRoutes(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [agentLocation?.lat, agentLocation?.lng]);

  const handleDirectionsCalculated = (legs: { distance: string; duration: string }[]) => {
    setRoutes((prev: any[]) => prev.map((route, idx) => {
      const leg = legs[idx];
      if (!leg) return route;
      return { ...route, totalDistance: leg.distance, estimatedTime: leg.duration };
    }));
  };

  const masterMapsUrl = routes.length > 0 && routes[0].latitude && routes[0].longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${routes[routes.length - 1].latitude || routes[0].latitude},${routes[routes.length - 1].longitude || routes[0].longitude}&travelmode=driving`
    : "https://www.google.com/maps";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Live GPS Telemetry & Navigation"
        title="Optimized Delivery & Pickup Route"
        description="System generated route plan using real-time GPS navigation to complete pickups and deliveries efficiently."
        icon={RouteIcon}
        liveLabel={gpsStatus === "ACTIVE" ? "GPS Active" : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={requestGpsLocation}
              variant="outline"
              className="h-10 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-black text-xs gap-2 backdrop-blur-md transition-all"
            >
              <LocateFixed size={15} className={gpsStatus === "ACQUIRING" ? "animate-spin" : ""} />
              {gpsStatus === "ACTIVE" ? "GPS Active (Update)" : gpsStatus === "ACQUIRING" ? "Locating…" : "Enable GPS Tracking"}
            </Button>
            <a
              href={masterMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 px-5 rounded-xl font-black text-xs transition-all hover:scale-[1.02]"
              style={{
                background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
                color: "var(--primary)",
              }}
            >
              <Navigation size={15} /> Open in Google Maps <ExternalLink size={12} />
            </a>
          </div>
        }
      />

      {/* ── 2. GPS Error Banner ──────────────────────────────────────────────── */}
      {gpsStatus === "ERROR" && (
        <div className="flex items-center justify-between p-4 rounded-3xl border border-warning/30 bg-warning/8">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-warning shrink-0" />
            <p className="text-xs font-black text-warning">
              {gpsErrorMsg || "GPS tracking permission blocked. Please allow Location access in your browser."}
            </p>
          </div>
          <Button
            onClick={requestGpsLocation}
            size="sm"
            className="h-8 px-3 rounded-xl text-white text-xs font-black gap-1.5 shrink-0"
            style={{ background: "var(--warning)" }}
          >
            <RefreshCw size={13} /> Retry GPS
          </Button>
        </div>
      )}

      {/* ── 3. Map Container ─────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-card-foreground flex items-center gap-2">
            <Navigation size={18} style={{ color: "var(--primary)" }} /> Real-Time Navigation Map
          </h2>
          {agentLocation && (
            <span
              className="text-[11px] font-black px-3 py-1 rounded-full border flex items-center gap-1.5"
              style={{
                background: "color-mix(in srgb, var(--success) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--success) 30%, transparent)",
                color: "var(--success)",
              }}
            >
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
              Live GPS Location Active
            </span>
          )}
        </div>
        <RouteMap
          routes={routes}
          agentLocation={agentLocation}
          onDirectionsCalculated={handleDirectionsCalculated}
        />
      </div>

      {/* ── 4. Route Stops Table ─────────────────────────────────────────────── */}
      <RouteTable routes={routes} loading={loading} search={search} setSearch={setSearch} />
    </motion.div>
  );
};

export default OptimizeRoute;
