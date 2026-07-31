"use client";

import React, { useState } from "react";
import { Edit3, Eye, Save, Sparkles, CheckCircle, Globe } from "lucide-react";
import { toast } from "sonner";

export default function PagesContentCMSPage() {
  const pagesList = [
    { id: "home", title: "Home / Landing Page", slug: "/", lastEdited: "Today, 10:30 AM", status: "PUBLISHED" },
    { id: "services", title: "Services & Dry Cleaning Catalog", slug: "/services", lastEdited: "Yesterday", status: "PUBLISHED" },
    { id: "pricing", title: "Transparent Pricing & Calculator", slug: "/pricing", lastEdited: "2 Days ago", status: "PUBLISHED" },
    { id: "about", title: "About Laundrix & Our Vision", slug: "/about", lastEdited: "1 Week ago", status: "PUBLISHED" },
    { id: "contact", title: "Contact Us & Store Locator", slug: "/contact", lastEdited: "2 Weeks ago", status: "PUBLISHED" },
    { id: "faq", title: "Frequently Asked Questions (FAQ)", slug: "/faq", lastEdited: "3 Days ago", status: "PUBLISHED" },
    { id: "terms", title: "Terms & Conditions", slug: "/terms", lastEdited: "1 Month ago", status: "PUBLISHED" },
  ];

  const [activeTab, setActiveTab] = useState("home");
  const [heroHeading, setHeroHeading] = useState("Premium Eco-Friendly Laundry & Dry Cleaning Delivered To Your Door");
  const [subheading, setSubheading] = useState("Schedule instant pickup in seconds. Professional care for suits, silk sarees, and everyday garments.");

  const currentPage = pagesList.find((p) => p.id === activeTab) || pagesList[0];

  const handleSave = () => {
    toast.success(`CMS Content for '${currentPage.title}' saved & published live!`);
  };

  return (
    <div className="space-y-6">
      {/* 7 Pages Horizontal Swipeable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {pagesList.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === p.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Selected CMS Page Editor */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Editing: {currentPage.title}
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {currentPage.status}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Route Slug: {currentPage.slug} | Last Edited: {currentPage.lastEdited}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Save size={14} /> Save & Publish
            </button>
          </div>
        </div>

        {/* Content Form Fields */}
        <div className="space-y-4 max-w-3xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Main Section Heading / Title
            </label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Subheading / Description Paragraph
            </label>
            <textarea
              rows={3}
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
            <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Live Content Preview Mode Enabled</p>
              <p className="text-blue-600 mt-0.5">Changes saved here are instantly distributed across edge CDN caches for all website visitors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
