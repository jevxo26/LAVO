"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, ShieldCheck, RefreshCw } from "lucide-react";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  status: string;
  adminPermission?: Record<string, boolean>;
}

export function AdminPermissionControl() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/permissions");
      setAdmins(res.data.data || []);
    } catch {
      toast.error("Failed to load admin permission metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleToggle = async (adminId: string, flag: string, currentValue: boolean) => {
    try {
      await axios.put(`/api/admin/permissions/${adminId}`, {
        [flag]: !currentValue,
      });
      toast.success("Permission flag updated");
      fetchAdmins();
    } catch {
      toast.error("Failed to update permission");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-semibold text-sm">Loading admin permissions matrix...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Lock className="text-blue-600" size={20} /> Dynamic Admin Permission Matrix
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Toggle operational permissions for Normal Admins in real time.</p>
        </div>
        <button onClick={fetchAdmins} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
              <th className="p-4">Admin User</th>
              <th className="p-4 text-center">Customer Ops</th>
              <th className="p-4 text-center">Branch Ops</th>
              <th className="p-4 text-center">Vendor Ops</th>
              <th className="p-4 text-center">Agent Ops</th>
              <th className="p-4 text-center">Employee Ops</th>
              <th className="p-4 text-center">Finance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => {
              const perms = admin.adminPermission || {};
              return (
                <tr key={admin.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className="font-bold text-slate-800 text-sm block">{admin.fullName}</span>
                    <span className="text-slate-400 text-xs">{admin.email}</span>
                  </td>
                  <td className="p-4 text-center"><ToggleSwitch active={!!perms.canManageCustomerOps} onChange={() => handleToggle(admin.id, "canManageCustomerOps", !!perms.canManageCustomerOps)} /></td>
                  <td className="p-4 text-center"><ToggleSwitch active={!!perms.canManageBranchOps} onChange={() => handleToggle(admin.id, "canManageBranchOps", !!perms.canManageBranchOps)} /></td>
                  <td className="p-4 text-center"><ToggleSwitch active={!!perms.canManageVendorOps} onChange={() => handleToggle(admin.id, "canManageVendorOps", !!perms.canManageVendorOps)} /></td>
                  <td className="p-4 text-center"><ToggleSwitch active={!!perms.canManageAgentOps} onChange={() => handleToggle(admin.id, "canManageAgentOps", !!perms.canManageAgentOps)} /></td>
                  <td className="p-4 text-center"><ToggleSwitch active={!!perms.canManageEmployeeOps} onChange={() => handleToggle(admin.id, "canManageEmployeeOps", !!perms.canManageEmployeeOps)} /></td>
                  <td className="p-4 text-center"><ToggleSwitch active={!!perms.canManageFinance} onChange={() => handleToggle(admin.id, "canManageFinance", !!perms.canManageFinance)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors mx-auto ${
        active ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
      }`}
    >
      <div className="w-4 h-4 bg-white rounded-full shadow-md" />
    </button>
  );
}
