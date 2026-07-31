"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Activity, RefreshCw, ShieldAlert, Lock, Search, AlertCircle } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/audit-logs").then(r => r.json());
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-purple-600" />
            System Audit Logs & Security History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of system configuration changes, admin overrides, and security events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
            <Lock size={14} /> Super Admin Exclusive
          </span>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Audit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-3" size={32} />
            Loading security logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-3 text-slate-300" size={32} />
            <p>No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Event ID</th>
                  <th className="py-3.5 px-6">Actor / User</th>
                  <th className="py-3.5 px-6">Action Performed</th>
                  <th className="py-3.5 px-6">Target Entity</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6">Severity</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-purple-600">{log.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{log.actorName || log.user?.fullName || "Admin"}</p>
                      <p className="text-xs text-slate-500">{log.actorEmail || log.user?.email || ""}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{log.action || "LOGIN"}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{log.target || log.device || "System"}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">{log.ipAddress || "103.48.26.11"}</td>
                    <td className="py-4 px-6 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          log.severity === "CRITICAL" || log.severity === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.severity || "INFO"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(log.timestamp || log.loginTime || Date.now()).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
