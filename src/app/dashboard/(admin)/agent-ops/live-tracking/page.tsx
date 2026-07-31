"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Truck, RefreshCw, Navigation, BatteryCharging, Phone } from "lucide-react";

export default function AgentLiveTrackingPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/agent-ops/live-tracking").then(r => r.json());
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="text-blue-600" />
            Delivery Agent Live Fleet Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time GPS dispatch monitor, active pickup routes, and device battery telemetry.
          </p>
        </div>
        <button
          onClick={fetchAgents}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Fleet GPS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {agents.map((ag) => (
          <div key={ag.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{ag.agentName}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {ag.phone}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {ag.currentStatus}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 flex items-center gap-1">
                <Navigation size={12} className="text-blue-600" /> Zone: {ag.assignedZone}
              </p>
              <p>GPS Coords: {ag.lat}, {ag.lng}</p>
              <p className="text-slate-400">Ping: {ag.lastPing}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">{ag.activePickups} Pickups | {ag.activeDeliveries} Drops</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <BatteryCharging size={14} /> {ag.batteryLevel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
