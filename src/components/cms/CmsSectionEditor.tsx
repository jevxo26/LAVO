"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export interface CmsSectionData {
  id?: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  content: string;
}

interface CmsSectionEditorProps {
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  sections: CmsSectionData[];
  onSaveSuccess?: () => void;
}

export const CmsSectionEditor: React.FC<CmsSectionEditorProps> = ({
  pageId,
  pageSlug,
  pageTitle,
  sections: initialSections,
  onSaveSuccess,
}) => {
  const [sections, setSections] = useState<CmsSectionData[]>(initialSections);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const handleSectionChange = (index: number, field: keyof CmsSectionData, value: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      for (const sec of sections) {
        const res = await fetch("/api/cms/sections", {
          method: "POST",
          headers,
          body: JSON.stringify({
            pageId,
            sectionKey: sec.sectionKey,
            title: sec.title,
            subtitle: sec.subtitle,
            content: sec.content,
          }),
        });
        if (!res.ok) throw new Error(`Failed to update section ${sec.sectionKey}`);
      }

      toast.success(`CMS content for '${pageTitle}' saved & published live!`);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update CMS page content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Editing: {pageTitle}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              PUBLISHED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Route Slug: /{pageSlug}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save & Publish Live</span>
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={sec.sectionKey || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section: <span className="text-blue-600 font-mono">{sec.sectionKey}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title / Heading</label>
              <input
                type="text"
                value={sec.title || ""}
                onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle / Category Tag</label>
              <input
                type="text"
                value={sec.subtitle || ""}
                onChange={(e) => handleSectionChange(idx, "subtitle", e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Content / Description Paragraph</label>
              <textarea
                rows={2}
                value={sec.content || ""}
                onChange={(e) => handleSectionChange(idx, "content", e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-normal text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
        <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Live Content Synchronization Active</p>
          <p className="text-blue-600 mt-0.5">
            Changes saved here update the database in real-time and automatically refresh marketing pages.
          </p>
        </div>
      </div>
    </div>
  );
};
