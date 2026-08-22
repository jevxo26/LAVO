"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Edit, Globe } from "lucide-react";
import { CmsSectionEditor } from "@/components/dashboard/shared/CmsSectionEditor";
import { PricingSectionEditor } from "@/components/dashboard/shared/PricingSectionEditor";
import { HeroSectionEditor } from "@/components/dashboard/shared/HeroSectionEditor";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Prisma } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionWithItems = Prisma.CmsSectionGetPayload<{
  include: { items: true };
}>;

interface CmsPageRecord {
  id:           string;
  slug:         string;
  title:        string;
  description?: string;
  sections:     SectionWithItems[];
}

// ─── Pages list ───────────────────────────────────────────────────────────────

const PAGES_LIST = [
  { id: "home",      title: "Home / Landing Page",     slug: "home"      },
  { id: "services",  title: "Services Catalog",         slug: "services"  },
  { id: "pricing",   title: "Pricing & Calculator",     slug: "pricing"   },
  { id: "story",     title: "About Laundrix / Story",   slug: "story"     },
  { id: "contact",   title: "Contact Us & Support",     slug: "contact"   },
  { id: "coverage",  title: "Coverage & Cities",        slug: "coverage"  },
  { id: "corporate", title: "Corporate B2B Solutions",  slug: "corporate" },
  { id: "partner",   title: "Partner Network",          slug: "partner"   },
  { id: "insights",  title: "Insights & Blog",          slug: "insights"  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagesContentCMSPage() {
  const [activeSlug,     setActiveSlug]     = useState("home");
  const [pageRecord,     setPageRecord]     = useState<CmsPageRecord | null>(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [editingSection, setEditingSection] = useState<SectionWithItems | null>(null);

  const fetchPageDetails = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res  = await fetch(`/api/cms/pages/${slug}`, { headers });
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setPageRecord(json.data);
      } else {
        setPageRecord(null);
      }
    } catch {
      toast.error("Error connecting to CMS backend API");
      setPageRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageDetails(activeSlug);
  }, [activeSlug, fetchPageDetails]);

  const currentPageInfo = PAGES_LIST.find((p) => p.slug === activeSlug) ?? PAGES_LIST[0];

  return (
    <div className="w-full space-y-5">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Super Admin — Content Studio"
        title="Website Pages Content"
        description="Edit public-facing landing pages, hero sections, pricing grids, and marketing copy across all 9 pages."
        icon={Globe}
        liveLabel="Live CMS"
        chips={[
          { label: "Total Pages",    value: String(PAGES_LIST.length), sub: "Marketing pages" },
          { label: "Active Page",    value: currentPageInfo.title,     sub: `/${activeSlug}`  },
        ]}
      />

      {/* ── Page selector tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
        {PAGES_LIST.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveSlug(p.slug)}
            className={[
              "flex items-center rounded-xl px-3 py-1.5 text-[11px] font-black",
              "whitespace-nowrap select-none transition-all duration-150",
              activeSlug === p.slug
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-card-foreground hover:bg-card/60",
            ].join(" ")}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* ── Sections grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 gap-3 text-muted-foreground text-sm font-semibold">
          <Loader2 size={20} className="animate-spin text-primary" />
          Loading CMS configuration…
        </div>
      ) : !pageRecord || pageRecord.sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Globe size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-black text-card-foreground">
            {currentPageInfo.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No sections found for this page. Run the database seeder to initialise CMS content.
          </p>
          <code className="mt-3 rounded-xl bg-muted border border-border px-4 py-2 text-xs font-mono text-card-foreground">
            npm run seed
          </code>
        </div>
      ) : (
        <>
          {/* Page title header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-card-foreground">
              {pageRecord.title}
              <span className="ml-2 text-[11px] font-mono font-bold text-muted-foreground">
                /{pageRecord.slug}
              </span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium">
              {pageRecord.sections.length} section{pageRecord.sections.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Section cards */}
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {pageRecord.sections
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
                  {/* Header */}
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
                      {section.items?.length ?? 0} items
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Order: {section.displayOrder}
                    </span>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </>
      )}

      {/* ── Section editor dialogs ───────────────────────────────────── */}
      {editingSection?.sectionKey === "hero" && activeSlug === "home" ? (
        <HeroSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={() => { setEditingSection(null); fetchPageDetails(activeSlug); }}
        />
      ) : editingSection?.sectionKey === "calculator" ? (
        <PricingSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={() => { setEditingSection(null); fetchPageDetails(activeSlug); }}
        />
      ) : editingSection ? (
        <CmsSectionEditor
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={() => { setEditingSection(null); fetchPageDetails(activeSlug); }}
        />
      ) : null}
    </div>
  );
}
