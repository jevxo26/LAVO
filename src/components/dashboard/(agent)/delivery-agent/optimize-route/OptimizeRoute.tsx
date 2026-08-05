"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Route as RouteIcon, MapPin, Navigation, Search, Sparkles } from "lucide-react";
import RouteTable from "./RouteTable";
import { motion } from "framer-motion";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export const OptimizeRoute = () => {
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Watch Agent Live Location
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setAgentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.warn("Agent Geolocation warning:", err?.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

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
              Live GPS Telemetry
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">Optimized Delivery &amp; Pickup Route</h1>
          <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
            System generated route plan using real-time GPS navigation to complete pickups and deliveries efficiently.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation size={18} className="text-blue-600 dark:text-cyan-400" /> Real-Time Navigation Map
          </h2>
        </div>
        <RouteMap routes={routes} onDirectionsCalculated={handleDirectionsCalculated} />
      </div>

      <RouteTable routes={routes} loading={loading} search={search} setSearch={setSearch} />
    </motion.div>
  );
};

export default OptimizeRoute;
