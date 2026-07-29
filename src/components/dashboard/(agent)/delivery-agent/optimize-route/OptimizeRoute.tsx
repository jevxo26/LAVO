"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Route, MapPin, Sparkles, Navigation, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import RouteTable from "./RouteTable";
import { OptimizedRoute } from "../types";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

const OptimizeRoute = () => {
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState([]);
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
      try {
        const token = localStorage.getItem("laundrix_token");
        const params: Record<string, number> = {};

        if (agentLocation) {
          params.lat = agentLocation.lat;
          params.lon = agentLocation.lng;
        }

        const res = await axios.get(
          "/api/delivery-agent/optimized-routes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params,
          }
        );

        setRoutes(res.data.data);
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

  const totalStops    = routes.reduce((s, r) => s + (r.totalStops ?? 0), 0);
  const totalPickups  = routes.reduce((s, r) => s + (r.pickups ?? 0), 0);
  const totalDeliveries = routes.reduce((s, r) => s + (r.deliveries ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Optimized Route"
        description="System generated route plan using real-time GPS navigation to complete pickups and deliveries efficiently."
      />

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            📍 Real-Time Navigation Map
          </h2>
          {agentLocation && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live GPS Active
            </span>
          )}
        </div>

        <div className="rounded-lg overflow-hidden border">
          <RouteMap
            routes={routes}
            agentLocation={agentLocation}
            onDirectionsCalculated={handleDirectionsCalculated}
          />
        </div>
      </div>


      <RouteToolbar
        search={search}
        setSearch={setSearch}
      />
      <RouteTable
        search={search}
        routes={routes}
      />
    </div>
  );
};

export default OptimizeRoute;
