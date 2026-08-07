"use client";

import React, { useState } from "react";
import { Headphones } from "lucide-react";
import { DashboardPageHero }  from "@/components/shared/DashboardPageHero";
import { SupportTicketsTab }  from "@/components/dashboard/(admin)/support/SupportTicketsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketCounts {
  total:   number;
  pending: number;
  live:    number;
  solved:  number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupportTicketsPage() {
  const [counts,  setCounts]  = useState<TicketCounts | null>(null);

  // Derived values — null = still loading
  const total   = counts?.total   ?? null;
  const pending = counts?.pending ?? null;
  const live    = counts?.live    ?? null;
  const solved  = counts?.solved  ?? null;

  const resolutionRate = (counts && counts.total > 0)
    ? `${Math.round((counts.solved / counts.total) * 100)}% resolved`
    : counts ? "No tickets yet" : null;

  const liveLabel = counts
    ? (counts.live > 0 ? `${counts.live} Live Chat Active` : "Help Desk")
    : "Help Desk";

  return (
    <div className="space-y-5">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Customer Operations"
        title="Support Tickets"
        description="Manage customer support requests, enable live chat sessions, and track complaint resolutions across the platform."
        icon={Headphones}
        liveLabel={liveLabel}
        chips={[
          {
            label: "Total Tickets",
            value: total   ?? "—",
            sub:   resolutionRate ?? "Loading…",
          },
          {
            label: "Pending Review",
            value: pending ?? "—",
            sub:   pending === null
              ? "Loading…"
              : pending > 0 ? "Awaiting response" : "All reviewed",
          },
          {
            label: "Live Chat",
            value: live    ?? "—",
            sub:   live    === null
              ? "Loading…"
              : live > 0 ? "Active sessions" : "None active",
          },
          {
            label: "Solved",
            value: solved  ?? "—",
            sub:   solved  === null
              ? "Loading…"
              : solved > 0 ? "Closed tickets" : "None solved yet",
          },
        ]}
      />

      {/* ── Tickets table ──────────────────────────────────────────────────── */}
      <SupportTicketsTab onCountsChange={setCounts} />

    </div>
  );
}
