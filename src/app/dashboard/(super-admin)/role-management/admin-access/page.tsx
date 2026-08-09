"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { authFetch } from "@/lib/api";
import {
  ShieldAlert, RefreshCw, Plus, Lock,
  Search, RotateCcw, ToggleLeft, ToggleRight,
} from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { Button }            from "@/components/ui/button";
import { toast }             from "sonner";
import { motion }            from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminPermissions {
  canManageCustomerOps:  boolean;
  canManageBranchOps:    boolean;
  canManageVendorOps:    boolean;
  canManageAgentOps:     boolean;
  canManageEmployeeOps:  boolean;
  canManageFinance:      boolean;
}

interface AdminEntry {
  id:              string;
  fullName:        string;
  email:           string;
  phone?:          string;
  assignedBranch?: string;
  status:          string;
  adminPermission?: Partial<AdminPermissions>;
}

// ─── Permission columns ───────────────────────────────────────────────────────

const PERM_COLS: { flag: keyof AdminPermissions; label: string }[] = [
  { flag: "canManageCustomerOps",  label: "Customer Ops" },
  { flag: "canManageBranchOps",    label: "Branch Ops"   },
  { flag: "canManageVendorOps",    label: "Vendor Ops"   },
  { flag: "canManageAgentOps",     label: "Agent Ops"    },
  { flag: "canManageEmployeeOps",  label: "Employee Ops" },
  { flag: "canManageFinance",      label: "Finance"      },
];

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      title={active ? "Enabled — click to disable" : "Disabled — click to enable"}
      className={[
        "flex h-5 w-10 items-center rounded-full p-0.5 transition-all duration-200 mx-auto",
        active ? "bg-success justify-end shadow-sm" : "bg-muted justify-start",
      ].join(" ")}
    >
      <div className="h-4 w-4 rounded-full bg-white shadow-md" />
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/50 px-5 py-3">
        <div className="grid grid-cols-[minmax(180px,2fr)_repeat(6,80px)] gap-4">
          {["Admin", ...PERM_COLS.map(c => c.label)].map((h) => (
            <Sk key={h} className="h-3 w-full" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3].map((i) => (
          <div key={i} className="grid grid-cols-[minmax(180px,2fr)_repeat(6,80px)] gap-4 items-center px-5 py-4">
            <div className="flex items-center gap-3">
              <Sk className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1"><Sk className="h-4 w-32" /><Sk className="h-3 w-24" /></div>
            </div>
            {PERM_COLS.map((c) => <Sk key={c.flag} className="h-5 w-10 rounded-full mx-auto" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoleManagementAdminAccessPage() {
  const [admins,     setAdmins]     = useState<AdminEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");

  const fetchAdmins = useCallback(() => {
    setRefreshing(true);
    authFetch("/role-management/admin-access")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setAdmins(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // ── Inline toggle with optimistic update ──────────────────────────────────
  const handleToggle = async (adminId: string, flag: keyof AdminPermissions, current: boolean) => {
    // Optimistic update
    setAdmins((prev) => prev.map((a) =>
      a.id === adminId
        ? { ...a, adminPermission: { ...a.adminPermission, [flag]: !current } }
        : a
    ));
    try {
      const res  = await authFetch(`/admin/permissions/${adminId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ [flag]: !current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      toast.success(`Permission updated for admin`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update permission");
      fetchAdmins(); // revert on error
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeCount = admins.filter((a) => a.status?.toUpperCase() === "ACTIVE").length;

  const displayed = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return admins;
    return admins.filter((a) =>
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.assignedBranch?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const hasSearch = !!search.trim();
  const gridCols  = `minmax(200px,2fr) repeat(${PERM_COLS.length}, 80px)`;

  return (
    <div className="space-y-5">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Role Management — Super Admin"
        title="Admin Role & Permission Control"
        description="Grant and revoke granular operational permissions for Normal Admin personnel. Changes take effect immediately."
        icon={ShieldAlert}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Total Admins", value: loading ? "—" : String(admins.length), sub: "Admin accounts"   },
          { label: "Active",       value: loading ? "—" : String(activeCount),   sub: "Currently active" },
          { label: "Permissions",  value: String(PERM_COLS.length),               sub: "Toggleable modules"},
        ]}
      />

      {/* ── 2. Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Warning notice */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3 flex-1">
          <Lock size={14} className="text-warning shrink-0" />
          <p className="text-xs font-bold text-card-foreground">
            Super Admin Only — Toggle changes apply immediately to all admin module access.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input
              type="text"
              placeholder="Search admin, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-52 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium
                text-card-foreground placeholder:text-muted-foreground/60
                focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition"
            />
          </div>
          {hasSearch && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchAdmins} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => toast.success("Opening Admin Role Creator…")}
            className="h-8 rounded-xl text-xs font-black gap-1.5">
            <Plus size={12} /> Create Admin Role
          </Button>
        </div>
      </div>

      {/* ── 3. Permission matrix table ──────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

          {/* Column headers */}
          <div className="border-b border-border bg-muted/50 overflow-x-auto">
            <div className="grid px-5 py-3 gap-4 min-w-max" style={{ gridTemplateColumns: gridCols }}>
              <p className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">Admin</p>
              {PERM_COLS.map(({ label }) => (
                <p key={label} className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center leading-tight">
                  {label}
                </p>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Search size={20} className="text-muted-foreground/30" />
              </div>
              <p className="text-sm font-black text-card-foreground">
                {hasSearch ? "No admins match your search" : "No admin accounts found"}
              </p>
              {hasSearch && (
                <Button size="sm" variant="outline" onClick={() => setSearch("")}
                  className="mt-3 rounded-xl text-xs font-bold gap-1">
                  <RotateCcw size={12} /> Clear
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border overflow-x-auto">
              {displayed.map((admin, idx) => {
                const perms     = admin.adminPermission ?? {};
                const isActive  = admin.status?.toUpperCase() === "ACTIVE";
                const enabledCount = PERM_COLS.filter(({ flag }) => !!perms[flag]).length;

                return (
                  <motion.div
                    key={admin.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group grid px-5 py-4 gap-4 items-center hover:bg-muted/40 transition-colors duration-150 min-w-max"
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    {/* Admin info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                        bg-gradient-to-br from-primary to-indigo-700 text-white text-[12px] font-black
                        shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                        {(admin.fullName ?? "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">
                            {admin.fullName}
                          </p>
                          <span className={`shrink-0 inline-flex items-center rounded-full border px-1.5 py-px text-[9px] font-black ${
                            isActive
                              ? "bg-success/10 text-success border-success/25"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] text-muted-foreground font-medium truncate">{admin.email}</p>
                          <span className="text-[10px] font-black text-muted-foreground/60 shrink-0">
                            {enabledCount}/{PERM_COLS.length} on
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Per-permission toggle */}
                    {PERM_COLS.map(({ flag }) => (
                      <div key={flag} className="flex items-center justify-center">
                        <Toggle
                          active={!!perms[flag]}
                          onChange={() => handleToggle(admin.id, flag, !!perms[flag])}
                        />
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-[11px] text-muted-foreground font-medium">
              Showing{" "}
              <span className="font-black text-card-foreground">{displayed.length}</span>
              {" "}of{" "}
              <span className="font-black text-card-foreground">{admins.length}</span>
              {" "}admins
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {activeCount} Active
              </span>
              <span className="flex items-center gap-1">
                <ToggleRight size={12} className="text-success" />
                Toggle to grant/revoke access
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
