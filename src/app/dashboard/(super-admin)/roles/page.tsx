"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { Plus, ShieldAlert, Shield } from "lucide-react";
import { CreateRoleModal } from "@/components/dashboard/shared/rbac/CreateRoleModal";
import { PermissionMatrix } from "@/components/dashboard/shared/rbac/PermissionMatrix";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { motion } from "framer-motion";

export default function RolesPage() {
  const [roles,       setRoles]       = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [loading,      setLoading]      = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        authFetch("/roles").then((r) => r.json()),
        authFetch("/roles/permissions").then((r) => r.json()),
      ]);
      setRoles(rolesRes.data ?? []);
      setPermissions(permsRes.data ?? []);
      setSelectedRole((prev: any) =>
        rolesRes.data?.find((r: any) => r.id === prev?.id) || rolesRes.data?.[0] || null
      );
    } catch (err) {
      console.error("Failed to load RBAC data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activePermissionIds = selectedRole?.permissions?.map((p: any) => p.permissionId) ?? [];

  return (
    <div className="space-y-6">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Super Admin — RBAC Studio"
        title="Roles & Permission Matrix"
        description="Configure fine-grained Role-Based Access Control. Assign module-level permissions to platform roles."
        icon={Shield}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Total Roles",       value: loading ? "—" : String(roles.length),       sub: "Platform roles"       },
          { label: "Total Permissions", value: loading ? "—" : String(permissions.length), sub: "Assignable actions"   },
          { label: "Selected Role",     value: loading ? "—" : (selectedRole?.displayName ?? "—"), sub: "Currently editing" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12">
          <p className="text-sm font-semibold text-muted-foreground">Loading RBAC details…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Roles list ────────────────────────────────────────────── */}
          <div className="lg:col-span-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-black text-card-foreground">Platform Roles</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">{roles.length} roles available</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm"
              >
                <Plus size={13} /> New Role
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {roles.map((role, idx) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setSelectedRole(role)}
                  className={[
                    "w-full text-left p-3.5 rounded-xl transition-all border flex flex-col gap-0.5",
                    selectedRole?.id === role.id
                      ? "bg-primary/8 border-primary/25 dark:bg-primary/15 dark:border-primary/30"
                      : "bg-transparent border-border hover:bg-muted/60",
                  ].join(" ")}
                >
                  <span className={`text-[13px] font-black ${selectedRole?.id === role.id ? "text-primary" : "text-card-foreground"}`}>
                    {role.displayName}
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] text-muted-foreground font-medium truncate flex-1">
                      {role.description || "No description"}
                    </span>
                    {role.permissions?.length > 0 && (
                      <span className={`ml-2 shrink-0 rounded-full px-1.5 py-px text-[9px] font-black tabular-nums ${
                        selectedRole?.id === role.id
                          ? "bg-primary/15 text-primary"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      }`}>
                        {role.permissions.length}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Permission matrix ─────────────────────────────────────── */}
          <div className="lg:col-span-8">
            {selectedRole ? (
              <PermissionMatrix
                roleId={selectedRole.id}
                roleName={selectedRole.displayName}
                allPermissions={permissions}
                initialActiveIds={activePermissionIds}
                onSaved={fetchData}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <ShieldAlert size={24} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm font-black text-card-foreground">Select a role</p>
                <p className="mt-1 text-xs text-muted-foreground">Choose a role from the left to edit its permissions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <CreateRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleCreated={fetchData}
      />
    </div>
  );
}
