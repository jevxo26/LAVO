"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`/api/audit-logs?search=${search}`);
      setLogs(res.data.data || []);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Security & Audit Trails</h3>
          <p className="text-slate-400 text-xs mt-0.5">Trace all platform changes and settings overrides.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Module</th>
              <th className="p-4">Action</th>
              <th className="p-4">Performed By</th>
              <th className="p-4 text-center">Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">No audit logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="text-sm text-slate-600 hover:bg-slate-50/50">
                  <td className="p-4 text-xs font-semibold text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-700">{log.module}</td>
                  <td className="p-4 font-medium text-slate-500">{log.action}</td>
                  <td className="p-4 font-semibold text-blue-900">{log.performedBy}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedLog(log)} className="text-slate-400 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-xl bg-white rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-bold text-slate-900">Change Details</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold text-slate-400 block text-xs">MODULE</span><span className="font-bold text-slate-700">{selectedLog.module}</span></div>
                <div><span className="font-bold text-slate-400 block text-xs">ACTION</span><span className="font-bold text-slate-700">{selectedLog.action}</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div><span className="font-bold text-slate-400 text-xs block uppercase">Old State</span><pre className="text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap">{selectedLog.oldValue || "N/A"}</pre></div>
                <div className="border-t border-slate-200/50 pt-2"><span className="font-bold text-slate-400 text-xs block uppercase">New State</span><pre className="text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap">{selectedLog.newValue || "N/A"}</pre></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
