"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock, Inbox, Search, RotateCcw,
  Filter, ChevronUp, ChevronDown, MessageSquare,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button }    from "@/components/ui/button";
import { motion }    from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id:          string;
  title:       string;
  description: string;
  priority:    string;
  status:      string;
  customerId:  string;
  createdAt:   string;
}

interface TicketCounts {
  total:   number;
  pending: number;
  live:    number;
  solved:  number;
}

type SortField = "createdAt" | "priority" | "status";
type SortDir   = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityStyle(p: string): { cls: string; dot: string; label: string; rank: number } {
  switch (p.toUpperCase()) {
    case "URGENT": return {
      cls:   "bg-error/10 text-error border-error/25 dark:bg-error/15 dark:border-error/30",
      dot:   "bg-error animate-pulse", label: "Urgent", rank: 4,
    };
    case "HIGH": return {
      cls:   "bg-warning/10 text-warning border-warning/25 dark:bg-warning/15 dark:border-warning/30",
      dot:   "bg-warning", label: "High", rank: 3,
    };
    case "MEDIUM": return {
      cls:   "bg-warning/10 text-warning border-warning/25 dark:bg-warning/15 dark:border-warning/30",
      dot:   "bg-warning/70", label: "Medium", rank: 2,
    };
    default: return {
      cls:   "bg-muted text-muted-foreground border-border",
      dot:   "bg-muted-foreground/50", label: "Normal", rank: 1,
    };
  }
}

function statusMeta(s: string): { cls: string; dot: string; label: string; rank: number } {
  switch (s) {
    case "enabled-live-chat": return {
      cls:   "bg-success/10 text-success border-success/25 dark:bg-success/15 dark:border-success/30",
      dot:   "bg-success animate-pulse", label: "Live Chat",      rank: 3,
    };
    case "pendingReview": return {
      cls:   "bg-warning/10 text-warning border-warning/25 dark:bg-warning/15 dark:border-warning/30",
      dot:   "bg-warning",               label: "Pending Review", rank: 2,
    };
    case "solved": return {
      cls:   "bg-primary/10 text-primary border-primary/25 dark:bg-primary/15 dark:border-primary/30",
      dot:   "bg-primary",               label: "Solved",         rank: 1,
    };
    default: return {
      cls:   "bg-muted text-muted-foreground border-border",
      dot:   "bg-muted-foreground/50",   label: s,                rank: 0,
    };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function TicketsSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl" />
        <Sk className="h-9 w-32 rounded-xl" />
        <Sk className="h-9 w-24 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-4 flex-1" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-5 w-24 rounded-full" />
            <Sk className="h-3 w-20" />
            <Sk className="h-8 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sort header ──────────────────────────────────────────────────────────────

function SortTh({ label, field, current, dir, onSort }: {
  label: string; field: SortField;
  current: SortField; dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <th className="px-4 py-3 text-left cursor-pointer select-none group" onClick={() => onSort(field)}>
      <div className="flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-card-foreground transition-colors">
        {label}
        <span className={`transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
          {active && dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </div>
    </th>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupportTicketsTab({ onCountsChange }: { onCountsChange?: (c: TicketCounts) => void }) {
  const [tickets,    setTickets]  = useState<Ticket[]>([]);
  const [loading,    setLoading]  = useState(true);
  const [search,     setSearch]   = useState("");
  const [filterStatus, setFilter] = useState("ALL");
  const [sortField,  setSortField] = useState<SortField>("createdAt");
  const [sortDir,    setSortDir]   = useState<SortDir>("desc");

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fallback: Ticket[] = [
      { id: "TCK-401", title: "Stain on Silk Dress after Dry Clean",    description: "Elena Rostova • Customer complaint",    priority: "HIGH",   status: "pendingReview",     customerId: "cust-401", createdAt: new Date(Date.now() - 600000).toISOString()   },
      { id: "TCK-402", title: "Delivery Agent arrived 30 mins late",    description: "David Miller • Logistics delay inquiry", priority: "MEDIUM", status: "enabled-live-chat", customerId: "cust-402", createdAt: new Date(Date.now() - 3600000).toISOString()  },
      { id: "TCK-403", title: "Wallet cashback missing for PROMO-EID",  description: "Sarah Jenkins • Promo cashback query",   priority: "LOW",    status: "solved",            customerId: "cust-403", createdAt: new Date(Date.now() - 86400000).toISOString() },
    ];

    authFetch("/admin/support/tickets")
      .then((r) => r.json())
      .then((d) => {
        const list = d.success && d.data?.length ? d.data : fallback;
        setTickets(list);
        onCountsChange?.({
          total:   list.length,
          pending: list.filter((t: Ticket) => t.status === "pendingReview").length,
          live:    list.filter((t: Ticket) => t.status === "enabled-live-chat").length,
          solved:  list.filter((t: Ticket) => t.status === "solved").length,
        });
      })
      .catch(() => setTickets(fallback))
      .finally(() => setLoading(false));
  }, []);

  // ── Sort handler ─────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  // ── Filtered + sorted list ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...tickets];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "ALL") list = list.filter((t) => t.status === filterStatus);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "priority") cmp = priorityStyle(a.priority).rank - priorityStyle(b.priority).rank;
      else if (sortField === "status")   cmp = statusMeta(a.status).rank   - statusMeta(b.status).rank;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [tickets, search, filterStatus, sortField, sortDir]);

  const hasFilters = search || filterStatus !== "ALL";

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return <TicketsSkeleton />;

  // ── Empty ────────────────────────────────────────────────────────────────
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Inbox size={24} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm font-black text-card-foreground">No tickets found</p>
        <p className="mt-1 text-xs text-muted-foreground">Customer support tickets will appear here.</p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-border px-5 py-3.5">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
          <input
            type="text"
            placeholder="Search by title or ticket ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs
              font-medium text-card-foreground placeholder:text-muted-foreground/60
              focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-9">
          <Filter size={12} className="text-muted-foreground shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="pendingReview">Pending Review</option>
            <option value="enabled-live-chat">Live Chat</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <Button
            size="sm" variant="ghost"
            onClick={() => { setSearch(""); setFilter("ALL"); }}
            className="h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 px-3 gap-1.5"
          >
            <RotateCcw size={12} /> Clear
          </Button>
        )}

        {/* Count */}
        <p className="text-[11px] text-muted-foreground sm:ml-auto shrink-0 tabular-nums">
          <span className="font-black text-card-foreground">{filtered.length}</span>
          {" "}of{" "}
          <span className="font-black text-card-foreground">{tickets.length}</span>
          {" "}tickets
        </p>
      </div>

      {/* ── No filter results ────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Search size={20} className="text-muted-foreground/30" />
          </div>
          <p className="text-sm font-black text-card-foreground">No tickets match your filters</p>
          <Button
            size="sm" variant="outline"
            onClick={() => { setSearch(""); setFilter("ALL"); }}
            className="mt-3 rounded-xl text-xs font-bold gap-1.5"
          >
            <RotateCcw size={12} /> Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            {/* ── Head ──────────────────────────────────────────────────── */}
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 text-[10.5px] font-black uppercase tracking-wider text-muted-foreground w-[38%]">
                  Title
                </th>
                <SortTh label="Priority" field="priority"  current={sortField} dir={sortDir} onSort={handleSort} />
                <SortTh label="Status"   field="status"    current={sortField} dir={sortDir} onSort={handleSort} />
                <SortTh label="Date"     field="createdAt" current={sortField} dir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>

            {/* ── Body ──────────────────────────────────────────────────── */}
            <tbody className="divide-y divide-border">
              {filtered.map((t) => {
                const prio   = priorityStyle(t.priority);
                const status = statusMeta(t.status);

                return (
                  <tr key={t.id} className="group hover:bg-muted/40 transition-colors duration-150">

                    {/* Title + description */}
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-black text-card-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-tight font-medium">
                        {t.description}
                      </p>
                    </td>

                    {/* Priority badge */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black ${prio.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${prio.dot}`} />
                        {prio.label}
                      </span>
                    </td>

                    {/* Status — inline select */}
                    <td className="px-4 py-4">
                      <select
                        value={t.status}
                        onChange={async (e) => {
                          const next = e.target.value;
                          setTickets((prev) =>
                            prev.map((tk) => tk.id === t.id ? { ...tk, status: next } : tk)
                          );
                          try {
                            await authFetch(`/tickets/${t.id}/status`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: next }),
                            });
                          } catch {
                            setTickets((prev) =>
                              prev.map((tk) => tk.id === t.id ? { ...tk, status: t.status } : tk)
                            );
                          }
                        }}
                        className={`rounded-full border px-2.5 py-[3px] text-[10px] font-black
                          cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors
                          ${status.cls}`}
                      >
                        <option value="pendingReview">Pending Review</option>
                        <option value="enabled-live-chat">Live Chat</option>
                        <option value="solved">Solved</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                        <Clock size={11} />
                        {new Date(t.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <Link href={`/dashboard/support/${t.id}`}>
                        <Button
                          size="sm"
                          className="h-8 rounded-xl px-3 text-[11px] font-black gap-1.5 shadow-sm
                            bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90
                            text-primary-foreground transition-all hover:scale-[1.02]"
                        >
                          <MessageSquare size={13} /> Respond & Chat
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
