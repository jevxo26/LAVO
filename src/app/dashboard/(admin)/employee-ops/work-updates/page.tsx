"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileCheck, RefreshCw, Clock, CheckCircle2 } from "lucide-react";

export default function EmployeeWorkUpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/employee-ops/work-updates");
      setUpdates(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="text-blue-600" />
            Branch Employee Shift & Work Updates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time garment scanning telemetry, quality pass rates, and shift logs.
          </p>
        </div>
        <button
          onClick={fetchUpdates}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Work Logs
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee Name</th>
                <th className="py-3.5 px-6">Branch</th>
                <th className="py-3.5 px-6">Shift Details</th>
                <th className="py-3.5 px-6">Garments Scanned</th>
                <th className="py-3.5 px-6">Quality Pass Rate</th>
                <th className="py-3.5 px-6">Rework Count</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {updates.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{u.employeeName}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{u.branchName}</td>
                  <td className="py-4 px-6 text-xs text-slate-500">{u.shift}</td>
                  <td className="py-4 px-6 font-bold text-blue-600">{u.garmentsScanned} Pcs</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">
                    {u.garmentsScanned > 0 ? `${Math.round((u.qualityPasses / u.garmentsScanned) * 100)}%` : "N/A"}
                  </td>
                  <td className="py-4 px-6 font-medium text-amber-600">{u.reworkRequired} Pcs</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        u.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.status}
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
