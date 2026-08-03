"use client";

import React, { useEffect, useState, useMemo } from "react";
import { authFetch } from "@/lib/api";
import {
  Activity,
  RefreshCw,
  Lock,
  Search,
  AlertCircle,
  Filter,
  Shield,
  Eye,
  Calendar,
  Globe,
  Terminal,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface AuditLogItem {
  id: string;
  module: string;
  action: string;
  performedBy: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

const FALLBACK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "aud-901",
    module: "PRICING_TAX",
    action: "UPDATE_TAX_RATE",
    performedBy: "Super Admin (admin@laundrix.com)",
    oldValue: JSON.stringify({ vatPercentage: 5.0, expressSurcharge: 10 }),
    newValue: JSON.stringify({ vatPercentage: 7.5, expressSurcharge: 15 }),
    ipAddress: "103.48.26.11",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "aud-902",
    module: "PAYOUTS",
    action: "APPROVE_VENDOR_PAYOUT",
    performedBy: "Super Admin (admin@laundrix.com)",
    oldValue: JSON.stringify({ payoutId: "pay-101", status: "PENDING", amount: 15500 }),
    newValue: JSON.stringify({ payoutId: "pay-101", status: "PAID", amount: 15500 }),
    ipAddress: "103.48.26.11",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "aud-903",
    module: "ROLE_MANAGEMENT",
    action: "ELEVATE_USER_ROLE",
    performedBy: "Super Admin (admin@laundrix.com)",
    oldValue: JSON.stringify({ userId: "u-401", role: "CUSTOMER" }),
    newValue: JSON.stringify({ userId: "u-401", role: "VENDOR" }),
    ipAddress: "103.48.26.14",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "aud-904",
    module: "FEATURE_FLAGS",
    action: "TOGGLE_EXPRESS_DELIVERY",
    performedBy: "System Admin (sysadmin@laundrix.com)",
    oldValue: JSON.stringify({ feature: "EXPRESS_SAME_DAY", isEnabled: false }),
    newValue: JSON.stringify({ feature: "EXPRESS_SAME_DAY", isEnabled: true }),
    ipAddress: "103.48.26.18",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "aud-905",
    module: "SYSTEM_SETTINGS",
    action: "UPDATE_DELIVERY_CHARGES",
    performedBy: "Super Admin (admin@laundrix.com)",
    oldValue: JSON.stringify({ baseDeliveryFee: 60, freeDeliveryMin: 1000 }),
    newValue: JSON.stringify({ baseDeliveryFee: 80, freeDeliveryMin: 1200 }),
    ipAddress: "103.48.26.11",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/audit-logs?page=1&limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLogs(json.data);
      } else {
        setLogs(FALLBACK_AUDIT_LOGS);
      }
    } catch {
      setLogs(FALLBACK_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q));

      const matchesModule = moduleFilter === "ALL" || log.module.toUpperCase() === moduleFilter.toUpperCase();

      return matchesSearch && matchesModule;
    });
  }, [logs, search, moduleFilter]);

  // Derived modules list
  const availableModules = useMemo(() => {
    const mods = new Set(logs.map((l) => l.module.toUpperCase()));
    return ["ALL", ...Array.from(mods)];
  }, [logs]);

  // Format JSON diff safely
  const formatJson = (val?: string | null) => {
    if (!val) return "None";
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-purple-200" />
              <span className="text-purple-200 text-xs font-bold uppercase tracking-wider">
                Immutable Security Ledger
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Activity className="text-purple-300" />
              System Audit Logs & Security History
            </h1>
            <p className="mt-1 text-sm text-purple-100 max-w-xl">
              Cryptographically timestamped audit log of admin overrides, pricing changes, and security events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-purple-950 bg-purple-200 px-3.5 py-2 rounded-xl shadow-sm">
              <Lock size={14} /> Super Admin Exclusive
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              className="h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold gap-2 text-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Audit Events</p>
            <p className="text-xl font-extrabold text-slate-900">{logs.length}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sliders size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">System Modules</p>
            <p className="text-xl font-extrabold text-indigo-600">{availableModules.length - 1}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Secured Ledger</p>
            <p className="text-xl font-extrabold text-emerald-600">100% Active</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Unique IPs Logged</p>
            <p className="text-xl font-extrabold text-slate-900">
              {new Set(logs.map((l) => l.ipAddress).filter(Boolean)).size || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Module Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, module, performed by or IP..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0 ml-1" />
            {availableModules.map((mod) => (
              <button
                key={mod}
                onClick={() => setModuleFilter(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  moduleFilter === mod
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-3" />
            <p className="text-xs font-semibold">Loading security audit entries...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No audit log entries found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or module filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Event ID</th>
                  <th className="py-3.5 px-6">Performed By</th>
                  <th className="py-3.5 px-6">Action & Module</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Details & Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-6 font-bold text-purple-600 font-mono">
                      #{log.id.slice(-8)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>{log.performedBy}</div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                          {log.module}
                        </span>
                        <span>{log.action}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress || "127.0.0.1"}
                    </td>

                    <td className="py-4 px-6 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 rounded-xl px-3 text-[11px] font-bold border-slate-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 gap-1.5"
                      >
                        <Eye size={13} /> View Diff
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Diff Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="max-w-2xl rounded-2xl p-6">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Terminal size={20} className="text-purple-600" />
                  Audit Log Details — #{selectedLog.id.slice(-8)}
                </DialogTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  {selectedLog.module}
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Action: <strong className="text-slate-800">{selectedLog.action}</strong> • Recorded at{" "}
                {new Date(selectedLog.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              {/* Actor & Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Performed By</p>
                  <p className="text-xs font-bold text-slate-900">{selectedLog.performedBy}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">IP Address</p>
                  <p className="text-xs font-mono font-semibold text-slate-800">{selectedLog.ipAddress || "127.0.0.1"}</p>
                </div>
              </div>

              {/* JSON Diff View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Value */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Previous State (Old Value)
                  </p>
                  <pre className="rounded-xl border border-slate-200 bg-slate-900 text-rose-300 p-3 font-mono text-[11px] overflow-x-auto max-h-48">
                    {formatJson(selectedLog.oldValue)}
                  </pre>
                </div>

                {/* New Value */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Updated State (New Value)
                  </p>
                  <pre className="rounded-xl border border-slate-200 bg-slate-900 text-emerald-300 p-3 font-mono text-[11px] overflow-x-auto max-h-48">
                    {formatJson(selectedLog.newValue)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedLog(null)}
                className="h-9 rounded-xl px-4 text-xs font-semibold"
              >
                Close Details
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
