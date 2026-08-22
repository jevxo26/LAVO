"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AuditLogTab() {
  const [logs,        setLogs]        = useState<any[]>([]);
  const [search,      setSearch]      = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [loading,     setLoading]     = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`/api/audit-logs?search=${search}`);
      setLogs(res.data.data || []);
    } catch { toast.error("Failed to load audit logs"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-card-foreground text-base">Security & Audit Trails</h3>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium">Trace all platform changes and settings overrides.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-2xl pl-9 pr-4 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-black">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Module</th>
              <th className="p-4">Action</th>
              <th className="p-4">Performed By</th>
              <th className="p-4 text-center">Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm font-medium animate-pulse">
                  Loading logs…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm font-medium">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="text-sm hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-xs font-bold text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-black text-card-foreground">{log.module}</td>
                  <td className="p-4 font-medium text-muted-foreground">{log.action}</td>
                  <td className="p-4 font-black text-card-foreground">{log.performedBy}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-xl rounded-3xl border border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-card-foreground">Change Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-black text-muted-foreground block text-[10px] uppercase tracking-wider mb-1">Module</span>
                  <span className="font-black text-card-foreground">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="font-black text-muted-foreground block text-[10px] uppercase tracking-wider mb-1">Action</span>
                  <span className="font-black text-card-foreground">{selectedLog.action}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
                <div>
                  <span className="font-black text-muted-foreground text-[10px] block uppercase tracking-wider mb-1">Old State</span>
                  <pre className="text-xs text-card-foreground overflow-x-auto whitespace-pre-wrap font-mono">
                    {selectedLog.oldValue || "N/A"}
                  </pre>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="font-black text-muted-foreground text-[10px] block uppercase tracking-wider mb-1">New State</span>
                  <pre className="text-xs text-card-foreground overflow-x-auto whitespace-pre-wrap font-mono">
                    {selectedLog.newValue || "N/A"}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
