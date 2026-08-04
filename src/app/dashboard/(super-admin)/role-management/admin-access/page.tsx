"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { ShieldAlert, RefreshCw, Plus, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function RoleManagementAdminAccessPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/role-management/admin-access").then(r => r.json());
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-blue-600" />
            Admin Role & Dynamic Permission Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Grant and manage granular operational permissions for normal Admin personnel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Lock size={14} /> Super Admin Only
          </span>
          <button
            onClick={() => toast.success("Opening Admin Role Creator Modal...")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus size={14} /> Create Admin Role
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Admin Name</th>
                <th className="py-3.5 px-6">Email / Contact</th>
                <th className="py-3.5 px-6">Assigned Branch Hub</th>
                <th className="py-3.5 px-6">Granted Permissions</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Modify Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{a.fullName}</td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{a.email}</p>
                    <p className="text-slate-400">{a.phone}</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{a.assignedBranch || "Central Hub"}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {(a.permissions || ["VIEW_LIVE_ORDERS", "MANAGE_INVENTORY"]).map((perm: string) => (
                        <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toast.info(`Editing permissions for ${a.fullName}`)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-200 transition-colors"
                    >
                      Configure Grants
                    </button>
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
