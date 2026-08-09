"use client";

import React, { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Permission {
  id:             string;
  module:         string;
  action:         string;
  permissionName: string;
}

interface PermissionMatrixProps {
  roleId:           string;
  roleName:         string;
  allPermissions:   Permission[];
  initialActiveIds: string[];
  onSaved:          () => void;
}

const MODULES = ["Order","Customer","Branch","Vendor","Payment","QR Tracking","Pickup","Delivery","Reports","Analytics"];
const ACTIONS  = ["Create","Read","Update","Delete","Approve","Assign","Export","Cancel"];

export function PermissionMatrix({ roleId, roleName, allPermissions, initialActiveIds, onSaved }: PermissionMatrixProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    setActiveIds(new Set(initialActiveIds));
  }, [initialActiveIds, roleId]);

  const togglePermission = (permId: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await authFetch(`/api/roles/${roleId}/permissions`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ permissionIds: Array.from(activeIds) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update");
      toast.success(`Permission matrix updated for ${roleName}`);
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Failed to update matrix");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-black text-card-foreground">Permission Control Matrix</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Toggle fine-grained access for <span className="font-black text-card-foreground">{roleName}</span></p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-[10.5px] font-black uppercase tracking-wider text-muted-foreground min-w-[140px]">
                Module
              </th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MODULES.map((module) => (
              <tr key={module} className="hover:bg-muted/40 transition-colors duration-100">
                <td className="px-4 py-3 text-[13px] font-black text-card-foreground">{module}</td>
                {ACTIONS.map((action) => {
                  const perm = allPermissions.find((p) => p.module === module && p.action === action);
                  return (
                    <td key={action} className="px-3 py-3 text-center">
                      {perm ? (
                        <input
                          type="checkbox"
                          checked={activeIds.has(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="h-4 w-4 cursor-pointer rounded accent-primary focus:ring-2 focus:ring-ring/50"
                        />
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">—</span>
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
