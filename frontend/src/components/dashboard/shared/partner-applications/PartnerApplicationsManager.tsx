"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth }    from "@/hooks/useAuth";
import { authFetch }  from "@/lib/api";
import { toast }      from "sonner";
import { motion }     from "framer-motion";
import {
  FileSearch, CheckCircle2, XCircle, Clock, Eye,
  Search, ShieldAlert, ShieldCheck, Building2,
  Phone, MapPin, UserCheck, UserX, RotateCcw,
  Store, Loader2, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PartnerApplication {
  id: string;
  phone: string;
  targetCity: string;
  experience?: string | null;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { fullName: string; email: string };
  reviewedBy?: { fullName: string } | null;
  reviewedAt?: string | null;
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK: PartnerApplication[] = [
  { id: "APP-101", phone: "+880 1711-223344", targetCity: "Dhaka (Gulshan & Banani)", experience: "5 years running dry cleaning franchise", reason: "Looking to expand operational scale with Laundrix.", status: "PENDING",  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),  user: { fullName: "Rahim Chowdhury", email: "rahim.c@example.com" } },
  { id: "APP-102", phone: "+880 1819-556677", targetCity: "Chittagong (GEC Circle)",  experience: "3 years commercial laundry services",        reason: "Partnering to fulfill bulk garment orders.",              status: "APPROVED", createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), user: { fullName: "Anisur Rahman",    email: "anisur@example.com"  }, reviewedBy: { fullName: "Super Admin" }, reviewedAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: "APP-103", phone: "+880 1912-990011", targetCity: "Sylhet (Zindabazar)",       experience: "No prior experience",                         reason: "Wants to start a new laundry shop.",                    status: "REJECTED", createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), user: { fullName: "Tariqul Islam",    email: "tariqul@example.com" }, reviewedBy: { fullName: "Super Admin" }, reviewedAt: new Date(Date.now() - 3600000 * 30).toISOString() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusMeta(s: string) {
  switch (s) {
    case "APPROVED": return { cls: "bg-success/10 text-success border-success/25",  dot: "bg-success",               label: "Approved" };
    case "REJECTED": return { cls: "bg-error/10  text-error  border-error/25",      dot: "bg-error",                 label: "Rejected" };
    default:         return { cls: "bg-warning/10 text-warning border-warning/25",  dot: "bg-warning animate-pulse", label: "Pending"  };
  }
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",      value: "ALL",      dotCls: "bg-muted-foreground/60"   },
  { label: "Pending",  value: "PENDING",  dotCls: "bg-warning animate-pulse" },
  { label: "Approved", value: "APPROVED", dotCls: "bg-success"               },
  { label: "Rejected", value: "REJECTED", dotCls: "bg-error"                 },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" />
        <Sk className="h-9 w-48 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="space-y-1.5 flex-1"><Sk className="h-4 w-36" /><Sk className="h-3 w-24" /></div>
            <Sk className="h-3 w-28" /><Sk className="h-3 w-28" /><Sk className="h-3 w-20" />
            <Sk className="h-5 w-20 rounded-full" /><Sk className="h-3 w-20" /><Sk className="h-8 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PartnerApplicationsManager() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [activeTab,     setActiveTab]     = useState<"ALL"|"PENDING"|"APPROVED"|"REJECTED">("ALL");
  const [selectedApp,   setSelectedApp]   = useState<PartnerApplication | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const rawRole     = (user as any)?.role || (user as any)?.userType || "";
  const role        = rawRole.toUpperCase().trim().replace(/[\s-]+/g, "_");
  const isSuperAdmin = ["SUPER_ADMIN", "SUPERADMIN"].includes(role);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchApplications = () => {
    setLoading(true);
    authFetch("/partner-applications?page=1&limit=100")
      .then((r) => r.json())
      .then((d) => setApplications(d.success && d.data?.length ? d.data : FALLBACK))
      .catch(() => setApplications(FALLBACK))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchApplications(); }, []);

  // ── Status update ────────────────────────────────────────────────────────
  const handleUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!isSuperAdmin) { toast.error("Permission denied: Super Admin only."); return; }
    setActionLoading(id + "_" + status);
    try {
      const res  = await authFetch(`/partner-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === "APPROVED" ? "Application approved! Applicant upgraded to VENDOR." : "Application rejected.");
        const patch = { status, reviewedBy: { fullName: (user as any)?.fullName || "Super Admin" }, reviewedAt: new Date().toISOString() };
        setApplications((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
        if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, ...patch } : null);
      } else { toast.error(data.message || "Failed to update."); }
    } catch { toast.error("Network error."); }
    finally { setActionLoading(null); }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const pendingCount  = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  const countFor = (val: string) =>
    val === "ALL" ? applications.length
    : applications.filter((a) => a.status === val).length;

  const displayed = useMemo(() => applications.filter((app) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      app.user.fullName.toLowerCase().includes(q) ||
      app.user.email.toLowerCase().includes(q) ||
      app.phone.toLowerCase().includes(q) ||
      app.targetCity.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q);
    const matchTab = activeTab === "ALL" || app.status === activeTab;
    return matchSearch && matchTab;
  }), [applications, search, activeTab]);

  const hasFilters = search.trim() || activeTab !== "ALL";

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Onboarding"
        title="Partner Applications"
        description="Review and manage vendor partnership requests submitted across the platform. Approve to upgrade applicants to verified VENDOR status."
        icon={Store}
        liveLabel={pendingCount > 0 ? `${pendingCount} Pending Review` : "All Reviewed"}
        chips={[
          { label: "Total",    value: loading ? "—" : String(applications.length), sub: "All applications"                          },
          { label: "Pending",  value: loading ? "—" : String(pendingCount),         sub: pendingCount  > 0 ? "Needs review" : "None" },
          { label: "Approved", value: loading ? "—" : String(approvedCount),        sub: "Active vendors"                            },
        ]}
      />

      {/* ── 2. Permission notice ──────────────────────────────────────────── */}
      <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-bold
        ${isSuperAdmin
          ? "border-success/25 bg-success/8 text-success"
          : "border-warning/25 bg-warning/8 text-warning"}`}>
        <div className="flex items-center gap-2.5">
          {isSuperAdmin
            ? <ShieldCheck size={16} className="shrink-0" />
            : <ShieldAlert size={16} className="shrink-0" />}
          <span className="font-bold text-card-foreground">
            {isSuperAdmin
              ? "Super Admin — Full approval/rejection access enabled."
              : "Read-Only — Application decisions are restricted to Super Admin."}
          </span>
        </div>
        <span className="rounded-full border border-current px-2.5 py-0.5 text-[10px] font-black uppercase">
          {role}
        </span>
      </div>

      {/* ── 3. Stat cards ─────────────────────────────────────────────────── */}
      {!loading && (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <OverviewStatCard title="Total Applications" value={String(applications.length)} icon={FileSearch}   gradient="from-primary to-indigo-700"      />
          <OverviewStatCard title="Pending Review"     value={String(pendingCount)}         icon={Clock}        gradient="from-amber-400 to-orange-500"    isPositive={pendingCount === 0} />
          <OverviewStatCard title="Approved Vendors"   value={String(approvedCount)}        icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"    />
          <OverviewStatCard title="Rejected"           value={String(rejectedCount)}        icon={XCircle}      gradient="from-error to-rose-600"          isPositive={false} />
        </motion.div>
      )}

      {/* ── 4. Filter toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button key={tab.value} onClick={() => setActiveTab(tab.value as typeof activeTab)}
                className={["flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black whitespace-nowrap select-none transition-all duration-150",
                  isActive ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground hover:bg-card/60"].join(" ")}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${tab.dotCls}`} />
                {tab.label}
                <span className={["rounded-full px-1.5 py-px text-[10px] font-black leading-none tabular-nums",
                  isActive ? "bg-primary/12 text-primary" : "bg-muted-foreground/10 text-muted-foreground"].join(" ")}>
                  {countFor(tab.value)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, city…"
              className="h-8 w-60 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium
                text-card-foreground placeholder:text-muted-foreground/60
                focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setActiveTab("ALL"); }}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── 5. Table ──────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <motion.div key={activeTab + search} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/50">
            <div className="grid grid-cols-[minmax(160px,2fr)_1fr_1fr_1fr_120px_1fr_auto] px-5 py-3 gap-4">
              {["Applicant","Contact","Target City","Experience","Status","Submitted","Actions"].map((h) => (
                <p key={h} className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">{h}</p>
              ))}
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <FileSearch size={20} className="text-muted-foreground/30" />
              </div>
              <p className="text-sm font-black text-card-foreground">No applications found</p>
              {hasFilters && (
                <Button size="sm" variant="outline" onClick={() => { setSearch(""); setActiveTab("ALL"); }}
                  className="mt-3 rounded-xl text-xs font-bold gap-1"><RotateCcw size={12} /> Clear Filters</Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border overflow-x-auto">
              {displayed.map((app, idx) => {
                const sm = statusMeta(app.status);
                return (
                  <motion.div key={app.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                    className="group grid grid-cols-[minmax(160px,2fr)_1fr_1fr_1fr_120px_1fr_auto]
                      px-5 py-4 gap-4 items-center hover:bg-muted/40 transition-colors duration-150">

                    {/* Applicant */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                        bg-gradient-to-br from-primary to-indigo-700 text-white text-[12px] font-black
                        shadow-md shadow-black/10 transition-transform group-hover:scale-110">
                        {app.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">
                          {app.user.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium truncate">{app.user.email}</p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-card-foreground">
                      <Phone size={11} className="text-muted-foreground shrink-0" />{app.phone}
                    </div>

                    {/* City */}
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-card-foreground">
                      <MapPin size={11} className="text-muted-foreground shrink-0" />{app.targetCity}
                    </div>

                    {/* Experience */}
                    <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[160px]">
                      {app.experience || <span className="text-muted-foreground/40 italic">Not specified</span>}
                    </p>

                    {/* Status */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}
                    </span>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <CalendarDays size={11} className="shrink-0" />
                      {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedApp(app)}
                        className="h-8 rounded-xl px-2.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1">
                        <Eye size={12} /> View
                      </Button>
                      {isSuperAdmin && app.status === "PENDING" && (
                        <>
                          <Button size="sm" variant="ghost"
                            disabled={!!actionLoading}
                            onClick={() => handleUpdate(app.id, "APPROVED")}
                            className="h-8 rounded-xl px-2.5 text-[11px] font-black text-muted-foreground hover:text-success hover:bg-success/10 gap-1">
                            {actionLoading === app.id + "_APPROVED" ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost"
                            disabled={!!actionLoading}
                            onClick={() => handleUpdate(app.id, "REJECTED")}
                            className="h-8 rounded-xl px-2.5 text-[11px] font-black text-muted-foreground hover:text-error hover:bg-error/10 gap-1">
                            {actionLoading === app.id + "_REJECTED" ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-[11px] text-muted-foreground font-medium">
              Showing <span className="font-black text-card-foreground">{displayed.length}</span> of{" "}
              <span className="font-black text-card-foreground">{applications.length}</span> applications
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />{pendingCount} Pending</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />{approvedCount} Approved</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-error" />{rejectedCount} Rejected</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 6. Detail Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!selectedApp} onOpenChange={(v) => !v && setSelectedApp(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-card-foreground">Application Detail</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submitted by {selectedApp?.user.fullName}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 pt-1">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${statusMeta(selectedApp.status).cls}`}>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${statusMeta(selectedApp.status).dot}`} />
                  {statusMeta(selectedApp.status).label}
                </span>
                {selectedApp.reviewedBy && (
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Reviewed by <span className="font-black text-card-foreground">{selectedApp.reviewedBy.fullName}</span>
                  </p>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2,    label: "Applicant",   value: selectedApp.user.fullName    },
                  { icon: MapPin,       label: "Target City", value: selectedApp.targetCity        },
                  { icon: Phone,        label: "Phone",       value: selectedApp.phone             },
                  { icon: CalendarDays, label: "Submitted",   value: new Date(selectedApp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                    <Icon size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className="text-[12px] font-bold text-card-foreground mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience */}
              {selectedApp.experience && (
                <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Experience</p>
                  <p className="text-xs text-card-foreground font-medium leading-relaxed">{selectedApp.experience}</p>
                </div>
              )}

              {/* Reason */}
              <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Reason for Application</p>
                <p className="text-xs text-card-foreground font-medium leading-relaxed">{selectedApp.reason}</p>
              </div>

              {/* Action buttons in modal */}
              {isSuperAdmin && selectedApp.status === "PENDING" && (
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1 h-9 rounded-xl text-xs font-black gap-1.5
                    bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:opacity-90 transition-all"
                    disabled={!!actionLoading}
                    onClick={() => handleUpdate(selectedApp.id, "APPROVED")}>
                    {actionLoading === selectedApp.id + "_APPROVED" ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                    Approve Vendor
                  </Button>
                  <Button className="flex-1 h-9 rounded-xl text-xs font-black gap-1.5
                    bg-gradient-to-br from-error to-rose-600 text-white hover:opacity-90 transition-all"
                    disabled={!!actionLoading}
                    onClick={() => handleUpdate(selectedApp.id, "REJECTED")}>
                    {actionLoading === selectedApp.id + "_REJECTED" ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />}
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
