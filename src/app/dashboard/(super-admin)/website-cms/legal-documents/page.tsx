"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { FileText, Plus, RefreshCw, Search, RotateCcw, Globe, Clock } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { OpsTable } from "@/components/shared/OpsTable";
import { toast }    from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LegalDoc {
  id:          string;
  title:       string;
  slug:        string;
  version:     string;
  lastUpdated: string;
  status:      string;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK: LegalDoc[] = [
  { id: "doc-01", title: "Terms of Service",          slug: "terms-of-service",        version: "v3.2", lastUpdated: "2026-03-01", status: "PUBLISHED" },
  { id: "doc-02", title: "Privacy Policy",            slug: "privacy-policy",          version: "v2.8", lastUpdated: "2026-02-15", status: "PUBLISHED" },
  { id: "doc-03", title: "Refund & Cancellation",     slug: "refund-policy",           version: "v1.5", lastUpdated: "2026-01-20", status: "PUBLISHED" },
  { id: "doc-04", title: "Garment Liability Terms",   slug: "garment-liability",       version: "v1.1", lastUpdated: "2026-01-10", status: "PUBLISHED" },
  { id: "doc-05", title: "Vendor Partnership Terms",  slug: "vendor-partner-terms",    version: "v2.0", lastUpdated: "2026-03-10", status: "DRAFT"     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "PUBLISHED": return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "Published" };
    case "DRAFT":     return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: "Draft"     };
    case "ARCHIVED":  return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: "Archived"  };
    default:          return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "—"    };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />; }
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-32 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-4 flex-1" /><Sk className="h-3 w-28 font-mono" />
            <Sk className="h-3 w-12" /><Sk className="h-3 w-24" /><Sk className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",       value: "ALL",       dotCls: "bg-muted-foreground/60"   },
  { label: "Published", value: "PUBLISHED", dotCls: "bg-success"               },
  { label: "Draft",     value: "DRAFT",     dotCls: "bg-warning animate-pulse" },
  { label: "Archived",  value: "ARCHIVED",  dotCls: "bg-muted-foreground/60"   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LegalDocumentsCMSPage() {
  const [docs,       setDocs]       = useState<LegalDoc[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchDocs = useCallback(() => {
    setRefreshing(true);
    authFetch("/website-cms/legal-documents")
      .then((r) => r.json())
      .then((res) => setDocs(res.success && res.data?.length ? res.data : FALLBACK))
      .catch(() => setDocs(FALLBACK))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const publishedCount = docs.filter((d) => d.status?.toUpperCase() === "PUBLISHED").length;
  const draftCount     = docs.filter((d) => d.status?.toUpperCase() === "DRAFT").length;

  const countFor = (val: string) =>
    val === "ALL" ? docs.length
    : docs.filter((d) => d.status?.toUpperCase() === val).length;

  const displayed = docs.filter((d) => {
    const q = search.toLowerCase().trim();
    return (
      (!q || d.title?.toLowerCase().includes(q) || d.slug?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || d.status?.toUpperCase() === activeTab)
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
            <input type="text" placeholder="Search documents…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-52 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchDocs} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => toast.success("Drafting new legal policy document…")}
            className="h-8 rounded-xl text-xs font-black gap-1.5">
            <Plus size={12} /> Add Policy
          </Button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(d) => d.id}
          displayed={displayed}
          totalCount={docs.length}
          noun="documents"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No documents found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No legal documents added yet."
          footerStats={[
            { dot: "bg-success", label: "Published", value: publishedCount },
            { dot: "bg-warning", label: "Draft",     value: draftCount,    pulse: true },
          ]}
          columns={[
            {
              header: "Document Title", width: "minmax(180px,2fr)",
              render: (d) => (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                    bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md shadow-black/10
                    transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                    <FileText size={15} strokeWidth={2.3} />
                  </div>
                  <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">
                    {d.title}
                  </p>
                </div>
              ),
            },
            {
              header: "Slug", width: "1.5fr",
              render: (d) => (
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold" style={{ color: "var(--secondary)" }}>
                  <Globe size={11} className="shrink-0" />/{d.slug}
                </div>
              ),
            },
            {
              header: "Version", width: "90px",
              render: (d) => (
                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-[3px] text-[10px] font-black text-muted-foreground w-fit">
                  {d.version}
                </span>
              ),
            },
            {
              header: "Last Updated", width: "140px",
              render: (d) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock size={11} className="shrink-0" />{d.lastUpdated}
                </div>
              ),
            },
            {
              header: "Status", width: "110px",
              render: (d) => {
                const sm = statusMeta(d.status);
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
