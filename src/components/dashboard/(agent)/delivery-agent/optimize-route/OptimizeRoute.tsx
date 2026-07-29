"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import RouteTable from "./RouteTable";
import RouteToolbar from "./RouteToolbar";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const RouteMap = dynamic(
  () => import("./RouteMap"),
  { ssr: false }
);

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
      }
    };

    fetchRoutes();
  }, [agentLocation?.lat, agentLocation?.lng]);

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
          <RouteMap routes={routes} agentLocation={agentLocation} />
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