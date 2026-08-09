"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { ShieldAlert, RefreshCw, Plus, Lock, Settings } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { Button }            from "@/components/ui/button";
import { toast }             from "sonner";
import { motion }            from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminEntry {
  id:             string;
  fullName:       string;
  email:          string;
  phone?:         string;
  assignedBranch?: string;
  permissions?:   string[];
  status:         string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="flex items-center gap-3 flex-1">
              <Sk className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5"><Sk className="h-4 w-36" /><Sk className="h-3 w-24" /></div>
            </div>
            <Sk className="h-3 w-24" />
            <Sk className="h-5 w-32 rounded-lg" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-8 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoleManagementAdminAccessPage() {
  const [admins,    setAdmins]    = useState<AdminEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);

  const fetchAdmins = useCallback(() => {
    setRefreshing(true);
    authFetch("/role-management/admin-access")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setAdmins(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const activeCount = admins.filter((a) => a.status?.toUpperCase() === "ACTIVE").length;

  return (
    <div className="space-y-5">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Role Management — Super Admin"
        title="Admin Role & Permission Control"
        description="Grant and manage granular operational permissions for Normal Admin personnel across all platform modules."
        icon={ShieldAlert}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Total Admins", value: loading ? "—" : String(admins.length), sub: "Admin accounts"  },
          { label: "Active",       value: loading ? "—" : String(activeCount),   sub: "Currently active" },
        ]}
      />

      {/* ── 2. Access notice + actions ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3 flex-1">
          <Lock size={14} className="text-warning shrink-0" />
          <p className="text-xs font-bold text-card-foreground">
            Super Admin Only — Permission changes take effect immediately for all admin operations.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={fetchAdmins} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => toast.success("Opening Admin Role Creator…")}
            className="h-8 rounded-xl text-xs font-black gap-1.5">
            <Plus size={12} /> Create Admin Role
          </Button>
        </div>
      </div>

      {/* ── 3. Table ────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey="admin-access"
          keyExtractor={(a) => a.id}
          displayed={admins}
          totalCount={admins.length}
          noun="admins"
          emptyTitle="No admin accounts found"
          emptyDefault="Admin users with permission grants will appear here."
          footerStats={[
            { dot: "bg-success", label: "Active", value: activeCount },
          ]}
          columns={[
            {
              header: "Admin Name", width: "minmax(180px,2fr)",
              render: (a) => (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white text-[12px] font-black shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                    {(a.fullName ?? "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{a.fullName}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{a.email}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Assigned Branch", width: "1fr",
              render: (a) => (
                <p className="text-[12px] font-bold text-card-foreground">{a.assignedBranch || "Central Hub"}</p>
              ),
            },
            {
              header: "Granted Permissions", width: "minmax(200px,2fr)",
              render: (a) => (
                <div className="flex flex-wrap gap-1">
                  {(a.permissions ?? ["VIEW_LIVE_ORDERS", "MANAGE_INVENTORY"]).map((perm: string) => (
                    <motion.span
                      key={perm}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-2 py-[2px] text-[9px] font-black text-primary"
                    >
                      {perm}
                    </motion.span>
                  ))}
                </div>
              ),
            },
            {
              header: "Status", width: "100px",
              render: (a) => {
                const isActive = a.status?.toUpperCase() === "ACTIVE";
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${isActive ? "bg-success/10 text-success border-success/25" : "bg-muted text-muted-foreground border-border"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? "bg-success animate-pulse" : "bg-muted-foreground/50"}`} />
                    {a.status}
                  </span>
                );
              },
            },
            {
              header: "Action", width: "140px",
              render: (a) => (
                <Button size="sm" variant="outline"
                  onClick={() => toast.info(`Editing permissions for ${a.fullName}`)}
                  className="h-8 rounded-xl text-[11px] font-black gap-1.5 hover:text-primary hover:border-primary/30 hover:bg-primary/8 transition-colors">
                  <Settings size={12} /> Configure
                </Button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
