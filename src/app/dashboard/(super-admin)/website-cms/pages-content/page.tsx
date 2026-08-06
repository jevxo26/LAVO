"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CmsSectionEditor, CmsSectionData } from "@/components/cms/CmsSectionEditor";
import { toast } from "sonner";

interface CmsPageRecord {
  id: string;
  slug: string;
  title: string;
  description?: string;
  sections: Array<{
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
  }>;
}

export default function PagesContentCMSPage() {
  const pagesList = [
    { id: "home", title: "Home / Landing Page", slug: "home" },
    { id: "services", title: "Services Catalog", slug: "services" },
    { id: "pricing", title: "Pricing & Calculator", slug: "pricing" },
    { id: "story", title: "About Laundrix / Story", slug: "story" },
    { id: "contact", title: "Contact Us & Support", slug: "contact" },
    { id: "coverage", title: "Coverage & Cities", slug: "coverage" },
    { id: "corporate", title: "Corporate B2B Solutions", slug: "corporate" },
    { id: "partner", title: "Partner Network", slug: "partner" },
    { id: "insights", title: "Insights & Blog", slug: "insights" },
  ];

  const [activeSlug, setActiveSlug] = useState("home");
  const [pageRecord, setPageRecord] = useState<CmsPageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPageDetails = async (slug: string) => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/cms/pages/${slug}`, { headers });
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setPageRecord(json.data);
      } else {
        setPageRecord({
          id: `fallback-${slug}`,
          slug,
          title: pagesList.find((p) => p.slug === slug)?.title || slug,
          sections: [
            {
              id: `sec-${slug}-hero`,
              sectionKey: "hero",
              title: "Welcome to Laundrix",
              subtitle: slug.toUpperCase(),
              content: "Edit this section in the CMS editor.",
            },
          ],
        });
      }
    } catch {
      toast.error("Error connecting to CMS backend API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageDetails(activeSlug);
  }, [activeSlug]);

  const currentPageInfo = pagesList.find((p) => p.slug === activeSlug) || pagesList[0];

  const parsedSections: CmsSectionData[] = (pageRecord?.sections || []).map((s) => ({
    id: s.id,
    sectionKey: s.sectionKey,
    title: s.title || "",
    subtitle: s.subtitle || "",
    content: s.content || "",
  }));

  return (
    <div className="w-full space-y-6">
      {/* 9 Marketing Pages Swipeable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {pagesList.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveSlug(p.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSlug === p.slug
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Editor Panel */}
      {isLoading ? (
        <div className="p-12 flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
            <Loader2 size={20} className="animate-spin text-blue-600" /> Loading CMS configuration...
          </div>
        </div>
      ) : (
        <CmsSectionEditor
          pageId={pageRecord?.id || "fallback-id"}
          pageSlug={currentPageInfo.slug}
          pageTitle={pageRecord?.title || currentPageInfo.title}
          sections={parsedSections}
          onSaveSuccess={() => fetchPageDetails(activeSlug)}
        />
      )}
    </div>
  );
}
