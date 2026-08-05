"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Route as RouteIcon, MapPin, Navigation, Search, Sparkles, LocateFixed, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import RouteTable from "./RouteTable";
import { motion } from "framer-motion";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export const OptimizeRoute = () => {
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"IDLE" | "ACQUIRING" | "ACTIVE" | "ERROR">("IDLE");
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
        setAgentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsStatus("ACTIVE");
        toast.success(`GPS Location Lock Acquired (${pos.coords.accuracy.toFixed(0)}m accuracy)`);
      },
      (err) => {
        console.warn("Agent Geolocation error:", err?.message);
        setGpsStatus("ERROR");
        let msg = "Could not get your location. Please grant GPS permission in browser settings.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "GPS Location Permission Denied. Please enable location access in browser site settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS Signal Unavailable. Ensure location services are turned on.";
        } else if (err.code === err.TIMEOUT) {
          msg = "GPS Location request timed out. Please try again.";
        }
        setGpsErrorMsg(msg);
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, []);

  // Watch Agent Live Location continuously
  useEffect(() => {
    requestGpsLocation();

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setAgentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsStatus("ACTIVE");
        },
        (err) => console.warn("Agent Geolocation watch warning:", err?.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [requestGpsLocation]);

  // Fetch routes (with optional agent position)
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("laundrix_token");
        const params: Record<string, number> = {};

        if (agentLocation) {
          params.lat = agentLocation.lat;
          params.lon = agentLocation.lng;
        }

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
    setRoutes((prevRoutes: any[]) =>
      prevRoutes.map((route, idx) => {
        const leg = legs[idx];
        if (!leg) return route;
        return {
          ...route,
          totalDistance: leg.distance,
          estimatedTime: leg.duration,
        };
      })
    );
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
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-blue-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-300" />
              <span className="text-cyan-200 text-xs font-black uppercase tracking-widest">
                Live GPS Telemetry &amp; Navigation
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Optimized Delivery &amp; Pickup Route
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              System generated route plan using real-time GPS navigation to complete pickups and deliveries efficiently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={requestGpsLocation}
              variant="outline"
              className="h-11 px-4 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-black text-xs gap-2 backdrop-blur-md"
            >
              <LocateFixed size={16} className={gpsStatus === "ACQUIRING" ? "animate-spin text-cyan-300" : "text-cyan-300"} />
              {gpsStatus === "ACTIVE" ? "GPS Active (Update)" : gpsStatus === "ACQUIRING" ? "Locating..." : "Enable GPS Tracking"}
            </Button>

            <a
              href={masterMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Navigation size={16} /> Open in Google Maps <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ── GPS Status Banner ────────────────────────────────────────────── */}
      {gpsStatus === "ERROR" && (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <p className="text-xs font-black">
              {gpsErrorMsg || "GPS tracking permission blocked. Please allow Location access in your browser."}
            </p>
          </div>
          <Button
            onClick={requestGpsLocation}
            size="sm"
            className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black gap-1.5 shrink-0"
          >
            <RefreshCw size={13} /> Retry GPS
          </Button>
        </div>
      )}

      {/* ── Map Container ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation size={18} className="text-blue-600 dark:text-cyan-400" /> Real-Time Navigation Map
          </h2>
          {agentLocation && (
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live GPS Location Active
            </span>
          )}
        </div>
        <RouteMap routes={routes} agentLocation={agentLocation} onDirectionsCalculated={handleDirectionsCalculated} />
      </div>

      {/* ── Route Stops Table with Navigation Buttons ────────────────────── */}
      <RouteTable routes={routes} loading={loading} search={search} setSearch={setSearch} />
    </motion.div>
  );
};

export default OptimizeRoute;
