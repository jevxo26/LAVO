"use client";

import React, { useState } from "react";
import { SupportTicketsTab }   from "@/components/dashboard/(admin)/support/SupportTicketsTab";
import { ReviewModerationTab } from "@/components/dashboard/(admin)/support/ReviewModerationTab";
import { AnnouncementsTab }    from "@/components/dashboard/(admin)/support/AnnouncementsTab";
import { DashboardPageHero }   from "@/components/shared/DashboardPageHero";
import { useAuth }             from "@/hooks/useAuth";
import { motion }              from "framer-motion";
import { Headphones, TicketCheck, Star, Megaphone } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "tickets" | "reviews" | "announcements";

interface TicketCounts {
  total: number; pending: number; live: number; solved: number;
}

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: "tickets",       label: "Support Tickets",   Icon: TicketCheck },
  { key: "reviews",       label: "Review Moderation", Icon: Star        },
  { key: "announcements", label: "Announcements",     Icon: Megaphone   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const [counts,    setCounts]    = useState<TicketCounts | null>(null);
  const { user } = useAuth();

  const isPlatformAdmin =
    user && ["SUPER_ADMIN", "ADMIN"].includes(user.userType?.toUpperCase() || "");

  const visibleTabs = isPlatformAdmin
    ? TABS
    : TABS.filter((t) => t.key === "tickets");

  // Derived values
  const liveLabel = counts
    ? (counts.live > 0 ? `${counts.live} Live Chat Active` : "Operations Centre")
    : "Operations Centre";

  const resolutionSub = counts && counts.total > 0
    ? `${Math.round((counts.solved / counts.total) * 100)}% resolved`
    : counts ? "No tickets yet" : "Loading…";

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Admin Operations"
        title="Support &amp; Operations"
        description="Manage support tickets, moderate customer reviews, and broadcast platform-wide announcements."
        icon={Headphones}
        liveLabel={liveLabel}
        chips={[
          {
            label: "Total Tickets",
            value: counts?.total   ?? "—",
            sub:   resolutionSub,
          },
          {
            label: "Pending",
            value: counts?.pending ?? "—",
            sub:   counts
              ? (counts.pending > 0 ? "Awaiting response" : "All reviewed")
              : "Loading…",
          },
          {
            label: "Live Chat",
            value: counts?.live    ?? "—",
            sub:   counts
              ? (counts.live > 0 ? "Active sessions" : "None active")
              : "Loading…",
          },
        ]}
      />

      {/* ── 2. Tab bar ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-2xl border border-border bg-muted p-1.5 shadow-sm w-fit">
        {visibleTabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={[
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black",
                "transition-all duration-150 select-none",
                active
                  ? "bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md"
                  : "text-muted-foreground hover:bg-card hover:text-card-foreground",
              ].join(" ")}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── 3. Tab content ─────────────────────────────────────────────────── */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "tickets" && (
          <SupportTicketsTab onCountsChange={setCounts} />
        )}
        {isPlatformAdmin && activeTab === "reviews" && (
          <ReviewModerationTab />
        )}
        {isPlatformAdmin && activeTab === "announcements" && (
          <AnnouncementsTab />
        )}
      </motion.div>

    </div>
  );
}
