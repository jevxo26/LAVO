"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { Lock, RefreshCw, Loader2 } from "lucide-react";

interface AdminUser {
  id:               string;
  fullName:         string;
  email:            string;
  status:           string;
  adminPermission?: Record<string, boolean>;
}

const PERM_COLUMNS = [
  { flag: "canManageCustomerOps",  label: "Customer Ops" },
  { flag: "canManageBranchOps",    label: "Branch Ops"   },
  { flag: "canManageVendorOps",    label: "Vendor Ops"   },
  { flag: "canManageAgentOps",     label: "Agent Ops"    },
  { flag: "canManageEmployeeOps",  label: "Employee Ops" },
  { flag: "canManageFinance",      label: "Finance"      },
];

// ─── Toggle switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={[
        "flex h-5 w-10 items-center rounded-full p-0.5 transition-all duration-200 mx-auto",
        active
          ? "bg-success justify-end shadow-sm"
          : "bg-muted justify-start",
      ].join(" ")}
    >
      <div className="h-4 w-4 rounded-full bg-white shadow-md" />
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPermissionControl() {
  const [admins,  setAdmins]  = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(() => {
    setLoading(true);
    authFetch("/api/admin/permissions")
      .then((r) => r.json())
      .then((res) => setAdmins(res.data ?? []))
      .catch(() => toast.error("Failed to load admin permission matrix"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleToggle = async (adminId: string, flag: string, current: boolean) => {
    // Optimistic update
    setAdmins((prev) => prev.map((a) =>
      a.id === adminId
        ? { ...a, adminPermission: { ...a.adminPermission, [flag]: !current } }
        : a
    ));
    try {
      const res  = await authFetch(`/api/admin/permissions/${adminId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ [flag]: !current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      toast.success("Permission updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
      fetchAdmins(); // revert
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md shadow-black/10">
            <Lock size={16} strokeWidth={2.3} />
          </div>
          <div>
            <h3 className="text-sm font-black text-card-foreground">Dynamic Admin Permission Matrix</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Toggle operational permissions for Normal Admins in real time.</p>
          </div>
        </div>
        <button
          onClick={fetchAdmins}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="text-xs font-semibold">Loading admin permissions…</span>
        </div>
      ) : admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-sm font-black text-card-foreground">No admin accounts found</p>
          <p className="text-xs text-muted-foreground mt-1">Admin users will appear here once created.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                  Admin User
                </th>
                {PERM_COLUMNS.map(({ label }) => (
                  <th key={label} className="px-3 py-3 text-center text-[10.5px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => {
                const perms = admin.adminPermission ?? {};
                return (
                  <tr key={admin.id} className="group hover:bg-muted/40 transition-colors duration-150">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white text-[12px] font-black shadow-sm">
                          {admin.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-card-foreground group-hover:text-primary transition-colors">
                            {admin.fullName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    {PERM_COLUMNS.map(({ flag }) => (
                      <td key={flag} className="px-3 py-4 text-center">
                        <ToggleSwitch
                          active={!!perms[flag]}
                          onChange={() => handleToggle(admin.id, flag, !!perms[flag])}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!loading && admins.length > 0 && (
        <div className="border-t border-border bg-muted/30 px-5 py-3">
          <p className="text-[11px] text-muted-foreground font-medium">
            Showing <span className="font-black text-card-foreground">{admins.length}</span> admin{admins.length !== 1 ? "s" : ""} — changes apply immediately
          </p>
        </div>
      )}
    </div>
  );
}
