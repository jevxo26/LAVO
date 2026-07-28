"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

interface Permission {
  id: string;
  module: string;
  action: string;
  permissionName: string;
}

interface PermissionMatrixProps {
  roleId: string;
  roleName: string;
  allPermissions: Permission[];
  initialActiveIds: string[];
  onSaved: () => void;
}

const MODULES = ["Order", "Customer", "Branch", "Vendor", "Payment", "QR Tracking", "Pickup", "Delivery", "Reports", "Analytics"];
const ACTIONS = ["Create", "Read", "Update", "Delete", "Approve", "Assign", "Export", "Cancel"];

export function PermissionMatrix({ roleId, roleName, allPermissions, initialActiveIds, onSaved }: PermissionMatrixProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActiveIds(new Set(initialActiveIds));
  }, [initialActiveIds, roleId]);

  const togglePermission = (permId: string) => {
    const next = new Set(activeIds);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setActiveIds(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/roles/${roleId}/permissions`, {
        permissionIds: Array.from(activeIds),
      });
      toast.success(`Matrix updated for ${roleName}`);
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update matrix");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Permission Control Matrix</h3>
          <p className="text-slate-400 text-xs mt-0.5">Toggle fine-grained access bounds for {roleName}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[150px]">Module</th>
              {ACTIONS.map((action) => (
                <th key={action} className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((module) => (
              <tr key={module} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-bold text-slate-700">{module}</td>
                {ACTIONS.map((action) => {
                  const perm = allPermissions.find((p) => p.module === module && p.action === action);
                  return (
                    <td key={action} className="p-4 text-center">
                      {perm ? (
                        <input
                          type="checkbox"
                          checked={activeIds.has(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
