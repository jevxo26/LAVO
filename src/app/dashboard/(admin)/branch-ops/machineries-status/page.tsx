"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Wrench, RefreshCw, AlertTriangle, CheckCircle2, Cpu } from "lucide-react";

export default function MachineriesStatusPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/branch-ops/machineries-status").then(r => r.json());
      setMachines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="text-blue-600" />
            Branch Machineries & Equipment Telemetry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor washing machines, tumble dryers, steam presses, and dry cleaning units.
          </p>
        </div>
        <button
          onClick={fetchMachines}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Telemetry
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Equipment ID & Name</th>
                <th className="py-3.5 px-6">Branch</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Operating Temp</th>
                <th className="py-3.5 px-6">Efficiency</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{m.machineName}</p>
                    <p className="text-xs text-blue-600 font-medium">{m.id}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{m.branchName}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{m.temperature}</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">{m.efficiency}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        m.status === "RUNNING"
                          ? "bg-emerald-100 text-emerald-800"
                          : m.status === "MAINTENANCE"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">{m.lastMaintenance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
