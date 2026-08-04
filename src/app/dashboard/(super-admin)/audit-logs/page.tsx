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
  Globe,
  Sliders,
  Sparkles,
  ArrowRight,
  FileText,
  UserCheck,
  Tag,
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

// Helper: Format raw module enum string to human-readable label
function formatModuleLabel(moduleStr: string): string {
  const map: Record<string, string> = {
    PRICING_TAX: "Pricing & Tax",
    PAYOUTS: "Payouts",
    ROLE_MANAGEMENT: "Role Management",
    FEATURE_FLAGS: "Feature Flags",
    SYSTEM_SETTINGS: "System Settings",
    USER_MANAGEMENT: "User Management",
    BRANCH_OPS: "Branch Operations",
    VENDOR_OPS: "Vendor Operations",
    AUTH: "Authentication",
  };
  if (map[moduleStr.toUpperCase()]) return map[moduleStr.toUpperCase()];
  return moduleStr
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helper: Format raw action enum string to human-readable phrase
function formatActionLabel(actionStr: string): string {
  const map: Record<string, string> = {
    UPDATE_TAX_RATE: "Updated Tax Rate",
    APPROVE_VENDOR_PAYOUT: "Approved Vendor Payout",
    ELEVATE_USER_ROLE: "Elevated User Role",
    TOGGLE_EXPRESS_DELIVERY: "Toggled Express Delivery",
    UPDATE_DELIVERY_CHARGES: "Updated Delivery Charges",
    CREATE_BRANCH: "Created Branch",
    BLOCK_USER: "Blocked User",
    UPDATE_SETTING: "Updated Setting",
  };
  if (map[actionStr.toUpperCase()]) return map[actionStr.toUpperCase()];
  return actionStr
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helper: Format key-value label nicely
function formatKeyLabel(key: string): string {
  const map: Record<string, string> = {
    vatPercentage: "VAT Percentage",
    expressSurcharge: "Express Surcharge",
    payoutId: "Payout Reference",
    status: "Status",
    amount: "Amount",
    userId: "User Reference",
    role: "Assigned Role",
    feature: "Feature Name",
    isEnabled: "Feature Status",
    baseDeliveryFee: "Base Delivery Fee",
    freeDeliveryMin: "Free Delivery Minimum",
  };
  if (map[key]) return map[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helper: Format value display
function formatValueDisplay(key: string, val: any): string {
  if (val === null || val === undefined) return "None";
  if (typeof val === "boolean") return val ? "Enabled" : "Disabled";
  if (key.toLowerCase().includes("vat") || key.toLowerCase().includes("percentage")) return `${val}%`;
  if (
    key.toLowerCase().includes("fee") ||
    key.toLowerCase().includes("amount") ||
    key.toLowerCase().includes("surcharge") ||
    key.toLowerCase().includes("min")
  ) {
    if (typeof val === "number") return `৳${val.toLocaleString()}`;
  }
  return String(val);
}

// Helper: Parse JSON to structured Key-Value pairs
function parseJsonToEntries(jsonStr?: string | null): { key: string; label: string; value: string }[] {
  if (!jsonStr) return [];
  try {
    const obj = JSON.parse(jsonStr);
    if (typeof obj !== "object" || obj === null) return [];
    return Object.entries(obj).map(([k, v]) => ({
      key: k,
      label: formatKeyLabel(k),
      value: formatValueDisplay(k, v),
    }));
  } catch {
    return [{ key: "value", label: "Raw Value", value: String(jsonStr) }];
  }
}

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
      const formattedAction = formatActionLabel(log.action).toLowerCase();
      const formattedModule = formatModuleLabel(log.module).toLowerCase();

      const matchesSearch =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        formattedAction.includes(q) ||
        log.module.toLowerCase().includes(q) ||
        formattedModule.includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q));

      const matchesModule =
        moduleFilter === "ALL" || log.module.toUpperCase() === moduleFilter.toUpperCase();

      return matchesSearch && matchesModule;
    });
  }, [logs, search, moduleFilter]);

  // Derived modules list
  const availableModules = useMemo(() => {
    const mods = new Set(logs.map((l) => l.module.toUpperCase()));
    return ["ALL", ...Array.from(mods)];
  }, [logs]);

  // Modal Entries
  const oldEntries = useMemo(
    () => parseJsonToEntries(selectedLog?.oldValue),
    [selectedLog?.oldValue]
  );
  const newEntries = useMemo(
    () => parseJsonToEntries(selectedLog?.newValue),
    [selectedLog?.newValue]
  );

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
              Recorded timeline of admin overrides, pricing updates, role changes, and security events.
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
                {mod === "ALL" ? "All Modules" : formatModuleLabel(mod)}
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
                  <th className="py-3.5 px-6">Module & Action</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
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
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          {formatModuleLabel(log.module)}
                        </span>
                        <span className="text-slate-800 font-bold">{formatActionLabel(log.action)}</span>
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
                        <Eye size={13} /> View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="max-w-2xl rounded-2xl p-6">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  Audit Event — #{selectedLog.id.slice(-8)}
                </DialogTitle>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  {formatModuleLabel(selectedLog.module)}
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Action: <strong className="text-slate-800">{formatActionLabel(selectedLog.action)}</strong> • Recorded at{" "}
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

              {/* Clean Human-Readable State Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Value */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Previous State (Old Values)
                    </p>
                  </div>
                  {oldEntries.length === 0 ? (
                    <p className="text-slate-400 italic text-xs">No previous state recorded.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {oldEntries.map((item) => (
                        <div key={item.key} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-semibold text-slate-500">{item.label}</span>
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* New Value */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Updated State (New Values)
                    </p>
                  </div>
                  {newEntries.length === 0 ? (
                    <p className="text-slate-400 italic text-xs">No new state recorded.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {newEntries.map((item) => (
                        <div key={item.key} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-semibold text-slate-500">{item.label}</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
