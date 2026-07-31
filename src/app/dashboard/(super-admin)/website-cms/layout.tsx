"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe, Megaphone, FileText, Layout } from "lucide-react";

export default function WebCMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const cmsNavTabs = [
    {
      name: "Pages Content (7 Pages)",
      href: "/dashboard/website-cms/pages-content",
      icon: Layout,
    },
    {
      name: "Announcements & Banners",
      href: "/dashboard/website-cms/announcements",
      icon: Megaphone,
    },
    {
      name: "Legal Documents & Policies",
      href: "/dashboard/website-cms/legal-documents",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="text-blue-600" />
            Website CMS & Marketing Content Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage public landing pages, pricing grids, promotional banners, and legal terms.
          </p>
        </div>

        {/* Swipeable / Scrollable Horizontal Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none border-t border-slate-100">
          {cmsNavTabs.map((tab) => {
            const isActive =
              pathname === tab.href || (tab.href !== "/dashboard/website-cms" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                )}
              >
                <tab.icon size={15} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
