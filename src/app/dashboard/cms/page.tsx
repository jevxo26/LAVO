"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Layout, Search, Edit, Eye, ChevronDown, Plus, ExternalLink, Globe, Smartphone, RefreshCw } from "lucide-react";
import Link from "next/link";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
import { PricingSectionEditor } from "@/components/dashboard/PricingSectionEditor";

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
  const [pages, setPages] = useState<PageWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPage, setExpandedPage] = useState<string | null>("home");
  const [refreshing, setRefreshing] = useState(false);
  const [editingSection, setEditingSection] = useState<Prisma.CmsSectionGetPayload<{ include: { items: true } }> | null>(null);

  const fetchPages = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await axios.get("/api/cms/pages");
      setPages(res.data.data);
      setExpandedPage((prev) => {
        if (res.data.data.length > 0 && !prev) {
          return res.data.data[0].slug;
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
    if (expandedPage === slug) {
      setExpandedPage(null);
    } else {
      setExpandedPage(slug);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layout className="text-blue-600" />
            Content Management
          </h1>
          <p className="text-slate-500 mt-1">Manage all public-facing pages and sections of the application.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm">
            <ExternalLink size={16} />
            View Live Site
          </Link>
          <button 
            onClick={fetchPages} 
            disabled={refreshing}
            className="flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
            <Plus size={16} />
            New Page
          </button>
        </div>
      </div>

      {/* Stats/Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Published Pages</p>
            <h3 className="text-2xl font-bold text-slate-900">{pages.filter(p => p.status === 'PUBLISHED').length || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Layout size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Sections</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {pages.reduce((acc, page) => acc + (page.sections?.length || 0), 0) || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">SEO Health</p>
            <h3 className="text-2xl font-bold text-slate-900">98%</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search pages..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
            <p>Loading CMS data...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layout className="mx-auto mb-4 text-slate-300" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No pages found</h3>
            <p className="max-w-md mx-auto mb-6">Your CMS is currently empty. You can run the database seeder to initialize the default pages.</p>
            <p className="font-mono bg-slate-100 px-4 py-2 rounded text-sm inline-block text-slate-700">npm run seed</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pages.map((page) => (
              <div key={page.id} className="group">
                {/* Page Row */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${expandedPage === page.slug ? 'bg-blue-50/30' : ''}`}
                  onClick={() => togglePage(page.slug)}
                >
                  <div className="flex items-center gap-4">
                    <button className={`w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all ${expandedPage === page.slug ? 'rotate-180 text-blue-600' : ''}`}>
                      <ChevronDown size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900">{page.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {page.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Globe size={12} /> /{page.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank" onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Preview">
                      <Eye size={18} />
                    </Link>
                  </div>
                </div>

                {/* Sections Dropdown */}
                {expandedPage === page.slug && (
                  <div className="bg-slate-50/50 p-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Page Sections</h4>
                    </div>
                    
                    {page.sections && page.sections.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {page.sections.sort((a, b) => a.displayOrder - b.displayOrder).map((section) => (
                          <div 
                            key={section.id} 
                            onClick={() => setEditingSection(section)}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group/card cursor-pointer flex flex-col h-full"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono bg-slate-50 px-2 py-1 rounded">
                                {section.sectionKey}
                              </span>
                              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <Edit size={14} />
                              </div>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1" title={section.title ?? undefined}>{section.title}</h5>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4" title={section.subtitle ?? undefined}>{section.subtitle}</p>
                            
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {section.items?.length || 0} items
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Order: {section.displayOrder}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
                        <p className="text-slate-500 text-sm mb-3">No sections found for this page.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingSection && editingSection.sectionKey === "calculator" ? (
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
