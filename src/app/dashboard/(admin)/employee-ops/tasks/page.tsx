"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import {
  ClipboardList, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, Search, RotateCcw, User, Calendar,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id:          string;
  title:       string;
  assignedTo:  string;
  branchName:  string;
  priority:    string;
  dueDate:     string;
  status:      string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityMeta(p: string) {
  switch (p?.toUpperCase()) {
    case "HIGH":   return { cls: "bg-error/10 text-error border-error/25",     dot: "bg-error animate-pulse", label: "High",   rank: 3 };
    case "MEDIUM": return { cls: "bg-warning/10 text-warning border-warning/25", dot: "bg-warning",           label: "Medium", rank: 2 };
    default:       return { cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50", label: "Low",  rank: 1 };
  }
}

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "COMPLETED":   return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "Completed"   };
    case "IN_PROGRESS": return { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary animate-pulse", label: "In Progress" };
    case "PENDING":     return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: "Pending"     };
    case "OVERDUE":     return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error animate-pulse",   label: "Overdue"     };
    default:            return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "—"      };
  }
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
        <Sk className="h-9 w-40 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-4 flex-1" />
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-20" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-3 w-20" />
            <Sk className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",         value: "ALL",         dotCls: "bg-muted-foreground/60"   },
  { label: "Pending",     value: "PENDING",     dotCls: "bg-warning animate-pulse" },
  { label: "In Progress", value: "IN_PROGRESS", dotCls: "bg-primary animate-pulse" },
  { label: "Completed",   value: "COMPLETED",   dotCls: "bg-success"               },
  { label: "Overdue",     value: "OVERDUE",     dotCls: "bg-error animate-pulse"   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeTasksPage() {
  const [tasks,      setTasks]      = useState<Task[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchTasks = useCallback(() => {
    setRefreshing(true);
    authFetch("/employee-ops/tasks")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setTasks(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Derived stats ──────────────────────────────────────────────────────
  const pending    = tasks.filter((t) => t.status?.toUpperCase() === "PENDING").length;
  const inProgress = tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS").length;
  const completed  = tasks.filter((t) => t.status?.toUpperCase() === "COMPLETED").length;
  const overdue    = tasks.filter((t) => t.status?.toUpperCase() === "OVERDUE").length;

  const countFor = (val: string) =>
    val === "ALL" ? tasks.length
    : tasks.filter((t) => t.status?.toUpperCase() === val).length;

  // ── Filtered list ──────────────────────────────────────────────────────
  const displayed = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q || t.title?.toLowerCase().includes(q) || t.assignedTo?.toLowerCase().includes(q) || t.branchName?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || t.status?.toUpperCase() === activeTab)
    );
  });

  const hasFilters   = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Employee Operations"
        title="Employee Task Operations"
        description="Assign, track, and monitor daily operational tasks for branch staff across all locations."
        icon={ClipboardList}
        liveLabel={overdue > 0 ? `${overdue} Overdue` : inProgress > 0 ? `${inProgress} In Progress` : "All Clear"}
        chips={[
          { label: "Total Tasks",  value: loading ? "—" : String(tasks.length), sub: "All assigned tasks"                          },
          { label: "In Progress",  value: loading ? "—" : String(inProgress),   sub: inProgress > 0 ? "Active now"    : "None"     },
          { label: "Overdue",      value: loading ? "—" : String(overdue),       sub: overdue    > 0 ? "Needs attention": "All good" },
        ]}
      />

      {/* ── 2. Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={[
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black",
                  "whitespace-nowrap select-none transition-all duration-150",
                  isActive
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground hover:bg-card/60",
                ].join(" ")}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${tab.dotCls}`} />
                {tab.label}
                <span className={[
                  "rounded-full px-1.5 py-px text-[10px] font-black leading-none tabular-nums",
                  isActive ? "bg-primary/12 text-primary" : "bg-muted-foreground/10 text-muted-foreground",
                ].join(" ")}>
                  {countFor(tab.value)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right — search + clear + refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input
              type="text"
              placeholder="Search task, employee, branch…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-60 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs
                font-medium text-card-foreground placeholder:text-muted-foreground/60
                focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition"
            />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchTasks}
            className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── 3. Table ────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(t) => t.id}
          displayed={displayed}
          totalCount={tasks.length}
          noun="tasks"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No tasks found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No task data available."
          footerStats={[
            { dot: "bg-warning", label: "Pending",     value: pending,    pulse: true },
            { dot: "bg-primary", label: "In Progress", value: inProgress, pulse: true },
            { dot: "bg-success", label: "Completed",   value: completed               },
            ...(overdue > 0 ? [{ dot: "bg-error", label: "Overdue", value: overdue, pulse: true }] : []),
          ]}
          columns={[
            {
              header: "Task Title", width: "minmax(180px,2fr)",
              render: (t) => {
                const isOverdue = t.status?.toUpperCase() === "OVERDUE";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                        text-white shadow-md shadow-black/10 transition-transform duration-200
                        group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: `linear-gradient(135deg, ${isOverdue ? "var(--error)" : "var(--primary)"}, ${isOverdue ? "var(--destructive)" : "var(--ring)"})`,
                      }}
                    >
                      <ClipboardList size={15} strokeWidth={2.3} />
                    </div>
                    <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">
                      {t.title}
                    </p>
                  </div>
                );
              },
            },
            {
              header: "Assigned To", width: "1fr",
              render: (t) => (
                <div className="flex items-center gap-1.5 min-w-0">
                  <User size={12} className="text-muted-foreground shrink-0" />
                  <p className="text-[12px] font-bold text-card-foreground truncate">{t.assignedTo}</p>
                </div>
              ),
            },
            {
              header: "Branch", width: "1fr",
              render: (t) => <p className="text-[12px] font-bold text-card-foreground truncate">{t.branchName}</p>,
            },
            {
              header: "Priority", width: "110px",
              render: (t) => {
                const pm = priorityMeta(t.priority);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${pm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${pm.dot}`} />
                    {pm.label}
                  </span>
                );
              },
            },
            {
              header: "Due Date", width: "140px",
              render: (t) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Calendar size={11} className="shrink-0" />
                  {t.dueDate}
                </div>
              ),
            },
            {
              header: "Status", width: "130px",
              render: (t) => {
                const sm = statusMeta(t.status);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />
                    {sm.label}
                  </span>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}
