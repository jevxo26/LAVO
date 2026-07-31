"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Route as RouteIcon, MapPin, Navigation, Search } from "lucide-react";
import RouteTable from "./RouteTable";

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

  const totalStops = routes.reduce((s, r) => s + (r.totalStops ?? 0), 0);
  const totalPickups = routes.reduce((s, r) => s + (r.pickups ?? 0), 0);
  const totalDeliveries = routes.reduce((s, r) => s + (r.deliveries ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <RouteIcon className="text-blue-600" />
          Optimized Delivery & Pickup Route
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          System generated route plan using real-time GPS navigation to complete pickups and deliveries efficiently.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Navigation size={18} className="text-blue-600" /> Real-Time Navigation Map
          </h2>
        </div>
        <RouteMap routes={routes} onDirectionsCalculated={handleDirectionsCalculated} />
      </div>

      <RouteTable routes={routes} loading={loading} search={search} setSearch={setSearch} />
    </div>
  );
};

export default OptimizeRoute;
