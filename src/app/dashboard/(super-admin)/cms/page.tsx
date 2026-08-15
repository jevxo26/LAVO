"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { authFetch } from "@/lib/api";
import { Layout, Search, Edit, Eye, ChevronDown, Plus, ExternalLink, Globe, Smartphone, RefreshCw, RotateCcw } from "lucide-react";
import Link from "next/link";
import { CmsSectionEditor } from "@/components/dashboard/shared/CmsSectionEditor";
import { PricingSectionEditor } from "@/components/dashboard/shared/PricingSectionEditor";
import { HeroSectionEditor } from "@/components/dashboard/shared/HeroSectionEditor";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";
import { motion }            from "framer-motion";

import { Prisma } from "@prisma/client";

type PageWithSections = Prisma.CmsPageGetPayload<{
  include: {
    sections: {
      include: {
        items: true
      }
    }
  }
}>;

export default function CMSDashboard() {
  const [pages,         setPages]         = useState<PageWithSections[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [expandedPage,  setExpandedPage]  = useState<string | null>("home");
  const [refreshing,    setRefreshing]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("ALL");
  const [editingSection, setEditingSection] = useState<Prisma.CmsSectionGetPayload<{ include: { items: true } }> | null>(null);

  const fetchPages = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await authFetch("/cms/pages").then(r => r.json());
      setPages(res.data);
      setExpandedPage((prev) => {
        if (res.data.length > 0 && !prev) {
          return res.data[0].slug;
        }
        return prev;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPages();
  }, [fetchPages]);

  const togglePage = (slug: string) => {
    setExpandedPage((prev) => prev === slug ? null : slug);
  };

  // ── Filtered pages ─────────────────────────────────────────────────────────
  const filteredPages = useMemo(() => pages.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  }), [pages, search, statusFilter]);

  const hasFilters   = !!(search.trim() || statusFilter !== "ALL");
  const clearFilters = () => { setSearch(""); setStatusFilter("ALL"); };

  const publishedCount = pages.filter((p) => p.status === "PUBLISHED").length;
  const draftCount     = pages.filter((p) => p.status !== "PUBLISHED").length;
  const countFor = (val: string) =>
    val === "ALL" ? pages.length
    : val === "PUBLISHED" ? publishedCount
    : draftCount;

  const STATUS_TABS = [
    { label: "All",       value: "ALL",       dotCls: "bg-muted-foreground/60" },
    { label: "Published", value: "PUBLISHED", dotCls: "bg-success"             },
    { label: "Draft",     value: "DRAFT",     dotCls: "bg-warning animate-pulse" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Super Admin — Content Studio"
        title="Content Management"
        description="Manage all public-facing pages and sections of the application."
        icon={Layout}
        liveLabel="Live CMS"
        chips={[
          { label: "Published Pages", value: loading ? "—" : String(pages.filter(p => p.status === "PUBLISHED").length), sub: "Live on website" },
          { label: "Total Sections",  value: loading ? "—" : String(pages.reduce((a, p) => a + (p.sections?.length || 0), 0)), sub: "Across all pages" },
          { label: "SEO Health",      value: "98%", sub: "All pages indexed" },
        ]}
      />

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <OverviewStatCard title="Published Pages"  value={pages.filter(p => p.status === "PUBLISHED").length} icon={Globe}       gradient="from-primary to-indigo-700"      />
          <OverviewStatCard title="Total Sections"   value={pages.reduce((a, p) => a + (p.sections?.length || 0), 0)} icon={Layout} gradient="from-violet-500 to-purple-600" />
          <OverviewStatCard title="SEO Health"       value="98%"                                                 icon={Smartphone}  gradient="from-emerald-500 to-teal-600"    />
        </div>
      )}

      {/* ── Main content area ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-border bg-muted/40 px-5 py-3.5">

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
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

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
              <input type="text" placeholder="Search pages…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex h-8 items-center gap-1 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 transition-colors">
                <RotateCcw size={12} /> Clear
              </button>
            )}
            <Link href="/" target="_blank"
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border bg-card text-xs font-bold text-card-foreground hover:bg-muted transition-colors">
              <ExternalLink size={12} /> Live Site
            </Link>
            <button onClick={fetchPages} disabled={refreshing}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all">
              <Plus size={13} /> New Page
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
            <RefreshCw className="animate-spin text-primary" size={28} />
            <p className="text-xs font-semibold">Loading CMS data…</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Layout size={24} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-black text-card-foreground">No pages found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Your CMS is currently empty. Run the database seeder to initialise default pages.
            </p>
            <code className="mt-3 rounded-xl bg-muted border border-border px-4 py-2 text-xs font-mono text-card-foreground">
              npm run seed
            </code>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Search size={20} className="text-muted-foreground/30" />
                </div>
                <p className="text-sm font-black text-card-foreground">No pages match your filters</p>
                <button onClick={clearFilters}
                  className="mt-3 flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors">
                  <RotateCcw size={12} /> Clear Filters
                </button>
              </div>
            ) : (
              filteredPages.map((page, idx) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group"
                >

                {/* ── Page row ─────────────────────────────────────────── */}
                <div
                  onClick={() => togglePage(page.slug)}
                  className={[
                    "flex items-center justify-between px-5 py-4 cursor-pointer transition-colors",
                    expandedPage === page.slug
                      ? "bg-primary/5 dark:bg-primary/10"
                      : "hover:bg-muted/40",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    <button className={[
                      "flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground",
                      "hover:text-primary hover:bg-primary/10 transition-all",
                      expandedPage === page.slug ? "rotate-180 text-primary" : "",
                    ].join(" ")}>
                      <ChevronDown size={16} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <h3 className="text-[13px] font-black text-card-foreground">{page.title}</h3>
                        <span className={[
                          "rounded-full px-2 py-[2px] text-[9px] font-black uppercase tracking-wider",
                          page.status === "PUBLISHED"
                            ? "bg-success/10 text-success border border-success/25"
                            : "bg-warning/10 text-warning border border-warning/25",
                        ].join(" ")}>
                          {page.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                        <Globe size={11} /> /{page.slug}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/${page.slug === "home" ? "" : page.slug}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Preview page"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                {/* ── Sections grid (expanded) ────────────────────────── */}
                {expandedPage === page.slug && (
                  <div className="border-t border-border bg-muted/30 px-5 py-5">
                    <p className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground mb-4">
                      Page Sections
                    </p>

                    {page.sections && page.sections.length > 0 ? (
                      <motion.div
                        initial="hidden" animate="show"
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {page.sections
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((section) => (
                            <motion.div
                              key={section.id}
                              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                              whileHover={{ y: -3, transition: { duration: 0.15 } }}
                              onClick={() => setEditingSection(section)}
                              className="group/card flex flex-col rounded-2xl border border-border bg-card
                                p-4 shadow-sm cursor-pointer hover:border-ring/50
                                hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                                transition-all duration-200"
                            >
                              {/* Card header */}
                              <div className="flex items-start justify-between mb-3">
                                <span className="rounded-lg border border-border bg-muted px-2 py-[3px]
                                  text-[10px] font-black font-mono text-muted-foreground">
                                  {section.sectionKey}
                                </span>
                                <div className="flex h-7 w-7 items-center justify-center rounded-xl
                                  bg-gradient-to-br from-primary to-indigo-700 text-white shadow-sm
                                  opacity-0 group-hover/card:opacity-100
                                  transition-all duration-200 group-hover/card:scale-110 group-hover/card:rotate-3">
                                  <Edit size={12} />
                                </div>
                              </div>

                              <h5 className="text-[13px] font-black text-card-foreground line-clamp-1 mb-1
                                group-hover/card:text-primary transition-colors">
                                {section.title}
                              </h5>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 font-medium mb-4 flex-1">
                                {section.subtitle}
                              </p>

                              <div className="flex items-center justify-between border-t border-border pt-3">
                                <span className="rounded-full border border-border bg-muted px-2.5 py-[3px]
                                  text-[10px] font-black text-muted-foreground">
                                  {section.items?.length || 0} items
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  Order: {section.displayOrder}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                        <p className="text-xs text-muted-foreground">No sections found for this page.</p>
                      </div>
                    )}
                  </div>
                )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {editingSection && editingSection.sectionKey === "hero" ? (
        <HeroSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={() => {
            setEditingSection(null);
            fetchPages();
          }}
        />
      ) : editingSection && editingSection.sectionKey === "calculator" ? (
        <PricingSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={() => {
            setEditingSection(null);
            fetchPages();
          }}
        />
      ) : editingSection ? (
        <CmsSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={() => {
            setEditingSection(null);
            fetchPages();
          }}
        />
      ) : null}
    </div>
  );
}
