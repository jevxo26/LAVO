"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert, RefreshCw, Truck } from "lucide-react";

export default function AgentVehicleStatusPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/agent-ops/vehicle-status");
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="text-blue-600" />
            Agent Fleet Vehicle Status & Maintenance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor electric delivery vans, cargo scooters, mileage, and scheduled servicing.
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Fleet Status
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Vehicle Reg Number</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Assigned Agent</th>
                <th className="py-3.5 px-6">Fuel / Charge Level</th>
                <th className="py-3.5 px-6">Odometer</th>
                <th className="py-3.5 px-6">Service Due</th>
                <th className="py-3.5 px-6">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{v.vehicleNumber}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
                      {v.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{v.assignedAgent}</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">{v.fuelOrBattery}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{v.odometerKm} Km</td>
                  <td className="py-4 px-6 text-xs text-slate-500">{v.maintenanceDueDate}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        v.status === "EXCELLENT"
                          ? "bg-emerald-100 text-emerald-800"
                          : v.status === "GOOD"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
