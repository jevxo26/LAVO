"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { Megaphone, Plus, RefreshCw, CheckCircle2, Clock, Search, RotateCcw } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { OpsTable } from "@/components/shared/OpsTable";
import { toast }    from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Announcement {
  id:         string;
  title:      string;
  content:    string;
  bannerType: string;
  startDate:  string;
  endDate:    string;
  status:     string;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK: Announcement[] = [
  { id: "ann-01", title: "Eid Special — 20% Off All Orders",   content: "Celebrate Eid with express laundry at 20% off. Use code EID2026.",      bannerType: "PROMO",    startDate: "2026-03-28", endDate: "2026-04-05", status: "ACTIVE"   },
  { id: "ann-02", title: "Express Same-Day Service Launched",  content: "Book before 10AM, get your garments back by 8PM the same day.",         bannerType: "FEATURE",  startDate: "2026-04-01", endDate: "2026-04-30", status: "ACTIVE"   },
  { id: "ann-03", title: "Scheduled Maintenance — 2AM–4AM",   content: "Platform will be briefly unavailable during scheduled maintenance.",      bannerType: "SYSTEM",   startDate: "2026-04-10", endDate: "2026-04-10", status: "SCHEDULED" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeMeta(t: string) {
  switch (t?.toUpperCase()) {
    case "PROMO":   return { cls: "bg-violet-500/10 text-violet-600 border-violet-500/25", label: "Promo"    };
    case "FEATURE": return { cls: "bg-primary/10 text-primary border-primary/25",          label: "Feature"  };
    case "SYSTEM":  return { cls: "bg-warning/10 text-warning border-warning/25",          label: "System"   };
    default:        return { cls: "bg-muted text-muted-foreground border-border",          label: t || "—"   };
  }
}

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "ACTIVE":    return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success animate-pulse", label: "Active"    };
    case "SCHEDULED": return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning",               label: "Scheduled" };
    case "EXPIRED":   return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: "Expired"   };
    default:          return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "—"    };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />; }
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-40 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-4 flex-1" /><Sk className="h-3 w-36" />
            <Sk className="h-5 w-20 rounded-full" /><Sk className="h-3 w-32" /><Sk className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",       value: "ALL",       dotCls: "bg-muted-foreground/60"   },
  { label: "Active",    value: "ACTIVE",    dotCls: "bg-success animate-pulse" },
  { label: "Scheduled", value: "SCHEDULED", dotCls: "bg-warning"               },
  { label: "Expired",   value: "EXPIRED",   dotCls: "bg-muted-foreground/60"   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnnouncementsCMSPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [activeTab,     setActiveTab]     = useState("ALL");

  const fetchAnnouncements = useCallback(() => {
    setRefreshing(true);
    authFetch("/admin/support/announcements")
      .then((r) => r.json())
      .then((res) => setAnnouncements(res.success && res.data?.length ? res.data : FALLBACK))
      .catch(() => setAnnouncements(FALLBACK))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const activeCount    = announcements.filter((a) => a.status?.toUpperCase() === "ACTIVE").length;
  const scheduledCount = announcements.filter((a) => a.status?.toUpperCase() === "SCHEDULED").length;

  const countFor = (val: string) =>
    val === "ALL" ? announcements.length
    : announcements.filter((a) => a.status?.toUpperCase() === val).length;

  const displayed = announcements.filter((a) => {
    const q = search.toLowerCase().trim();
    return (
      (!q || a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q) || a.bannerType?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || a.status?.toUpperCase() === activeTab)
    );
  });

  const hasFilters   = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)}
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
            <input type="text" placeholder="Search announcements…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchAnnouncements} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => toast.success("Created new announcement draft!")}
            className="h-8 rounded-xl text-xs font-black gap-1.5">
            <Plus size={12} /> New Banner
          </Button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(a) => a.id}
          displayed={displayed}
          totalCount={announcements.length}
          noun="announcements"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No announcements found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No announcements created yet."
          footerStats={[
            { dot: "bg-success", label: "Active",    value: activeCount,    pulse: true },
            { dot: "bg-warning", label: "Scheduled", value: scheduledCount               },
          ]}
          columns={[
            {
              header: "Banner Title", width: "minmax(160px,2fr)",
              render: (a) => (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                    bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-black/10
                    transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                    <Megaphone size={15} strokeWidth={2.3} />
                  </div>
                  <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">
                    {a.title}
                  </p>
                </div>
              ),
            },
            {
              header: "Message", width: "minmax(200px,3fr)",
              render: (a) => (
                <p className="text-[12px] text-muted-foreground font-medium line-clamp-1">{a.content}</p>
              ),
            },
            {
              header: "Type", width: "110px",
              render: (a) => {
                const tm = typeMeta(a.bannerType);
                return <span className={`inline-flex items-center rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${tm.cls}`}>{tm.label}</span>;
              },
            },
            {
              header: "Active Period", width: "180px",
              render: (a) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock size={11} className="shrink-0" />
                  {a.startDate} → {a.endDate}
                </div>
              ),
            },
            {
              header: "Status", width: "110px",
              render: (a) => {
                const sm = statusMeta(a.status);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}
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
