"use client";

import React, { useState } from "react";
import { SupportTicketsTab }   from "@/components/dashboard/support/SupportTicketsTab";
import { ReviewModerationTab } from "@/components/dashboard/support/ReviewModerationTab";
import { AnnouncementsTab }    from "@/components/dashboard/support/AnnouncementsTab";
import { useAuth } from "@/hooks/useAuth";
import {
  Headphones,
  TicketCheck,
  Star,
  Megaphone,
  Sparkles,
} from "lucide-react";

type Tab = "tickets" | "reviews" | "announcements";

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: "tickets",       label: "Support Tickets",  Icon: TicketCheck },
  { key: "reviews",       label: "Review Moderation", Icon: Star        },
  { key: "announcements", label: "Announcements",     Icon: Megaphone   },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const { user } = useAuth();

  const isPlatformAdmin =
    user && ["SUPER_ADMIN", "ADMIN"].includes(user.userType?.toUpperCase() || "");

  const visibleTabs = isPlatformAdmin ? TABS : TABS.filter((t) => t.key === "tickets");

  return (
    <div className="space-y-7">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8  h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">
                Operations Center
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Support &amp; Operations
            </h1>
            <p className="mt-1 text-sm text-indigo-200">
              Manage tickets, moderate reviews, and broadcast announcements.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
            <Headphones size={22} className="text-indigo-200" />
          </div>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm w-fit">
        {visibleTabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150
                ${active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div>
        {activeTab === "tickets" && <SupportTicketsTab />}
        {isPlatformAdmin && activeTab === "reviews"       && <ReviewModerationTab />}
        {isPlatformAdmin && activeTab === "announcements" && <AnnouncementsTab />}
      </div>
    </div>
  );
}
