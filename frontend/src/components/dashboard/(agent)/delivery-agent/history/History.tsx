"use client";

import { useState } from "react";
import { Search, RotateCcw, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryTable from "./HistoryTable";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

const History = () => {
  const [search, setSearch] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      <DashboardPageHero
        badge="Delivery Agent Logs"
        title="Completed Dispatch History"
        description="View all completed pickups and doorstep deliveries with timestamped OTP audit logs."
        icon={HistoryIcon}
      />

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5">
              <RotateCcw size={13} /> Clear Search
            </Button>
          )}
        </div>
      </div>

      <HistoryTable search={search} />
    </motion.div>
  );
};

export default History;
