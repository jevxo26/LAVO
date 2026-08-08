"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe, Megaphone, FileText, Layout } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

const CMS_TABS = [
  { name: "Pages Content",             href: "/dashboard/website-cms/pages-content",   icon: Layout   },
  { name: "Announcements & Banners",   href: "/dashboard/website-cms/announcements",   icon: Megaphone },
  { name: "Legal Documents & Policies",href: "/dashboard/website-cms/legal-documents", icon: FileText  },
];

export default function WebCMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Super Admin — Content Studio"
        title="Website CMS & Marketing"
        description="Manage public landing pages, pricing grids, promotional banners, and legal terms across the platform."
        icon={Globe}
        liveLabel="Live CMS"
      />

      {/* ── Tab navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none w-fit">
        {CMS_TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard/website-cms" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black",
                "whitespace-nowrap transition-all duration-150 select-none",
                isActive
                  ? "bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md"
                  : "text-muted-foreground hover:bg-card hover:text-card-foreground"
              )}
            >
              <tab.icon size={13} />
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div>{children}</div>
    </div>
  );
}
