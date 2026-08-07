"use client";

import React, { useEffect, useState } from "react";
import { Headphones } from "lucide-react";
import { authFetch } from "@/lib/api";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { SupportTicketsTab } from "@/components/dashboard/(admin)/support/SupportTicketsTab";

export default function SupportTicketsPage() {
  const [counts, setCounts] = useState({ total: 0, pending: 0, live: 0, solved: 0 });

  useEffect(() => {
    authFetch("/admin/support/tickets")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          const data = d.data;
          setCounts({
            total:   data.length,
            pending: data.filter((t: any) => t.status === "pendingReview").length,
            live:    data.filter((t: any) => t.status === "enabled-live-chat").length,
            solved:  data.filter((t: any) => t.status === "solved").length,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Customer Operations"
        title="Support Tickets"
        description="Manage and respond to customer support requests, live chat sessions, and complaint resolutions."
        icon={Headphones}
        liveLabel="Help Desk"
        chips={[
          { label: "Total Tickets", value: counts.total                                       },
          { label: "Pending",       value: counts.pending, sub: "Awaiting review"             },
          { label: "Live Chat",     value: counts.live,    sub: counts.live > 0 ? "Active" : "None" },
        ]}
      />
      <SupportTicketsTab />
    </div>
  );
}
