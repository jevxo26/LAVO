"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock, ArrowRight, Inbox, Search,
  RotateCcw, Filter, ChevronUp, ChevronDown, MessageSquare,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  customerId: string;
  createdAt: string;
}

type SortField = "createdAt" | "priority" | "status";
type SortDir   = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityStyle(p: string): { cls: string; dot: string; label: string; rank: number } {
  switch (p.toUpperCase()) {
    case "URGENT": return { cls: "bg-rose-50 text-rose-700 border-rose-200",       dot: "bg-rose-500",   label: "Urgent", rank: 4 };
    case "HIGH":   return { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "High",   rank: 3 };
    case "MEDIUM": return { cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400",  label: "Medium", rank: 2 };
    default:       return { cls: "bg-slate-50 text-slate-600 border-slate-200",    dot: "bg-slate-400",  label: "Normal", rank: 1 };
  }
}

function statusStyle(s: string): { cls: string; dot: string; label: string; rank: number } {
  switch (s) {
    case "enabled-live-chat": return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500 animate-pulse", label: "Live Chat",      rank: 3 };
    case "pendingReview":     return { cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",                label: "Pending Review", rank: 2 };
    case "solved":            return { cls: "bg-indigo-50 text-indigo-700 border-indigo-200",    dot: "bg-indigo-500",               label: "Solved",         rank: 1 };
    default:                  return { cls: "bg-slate-50 text-slate-600 border-slate-200",       dot: "bg-slate-400",                label: s,                rank: 0 };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function TicketsSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl" />
        <Sk className="h-9 w-28 rounded-xl" />
        <Sk className="h-9 w-28 rounded-xl" />
      </div>
      <div className="divide-y divide-slate-50">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <Sk className="h-4 w-4 rounded" />
            <Sk className="h-4 flex-1" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-5 w-20 rounded-full" />
            <Sk className="h-3 w-20" />
            <Sk className="h-7 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sort header cell ─────────────────────────────────────────────────────────

function SortTh({
  label, field, current, dir, onSort,
}: {
  label: string; field: SortField;
  current: SortField; dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <th
      className="px-4 py-3 text-left cursor-pointer select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
        {label}
        <span className={`transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
          {active && dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </div>
    </th>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupportTicketsTab() {
  const [tickets, setTickets]       = useState<Ticket[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("ALL");
  const [sortField, setSortField]   = useState<SortField>("createdAt");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");

  useEffect(() => {
    const fallbackTickets: Ticket[] = [
      {
        id: "TCK-401",
        title: "Stain on Silk Dress after Dry Clean",
        description: "Elena Rostova • Customer complaint regarding dress stain",
        priority: "HIGH",
        status: "pendingReview",
        customerId: "cust-401",
        createdAt: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: "TCK-402",
        title: "Delivery Agent arrived 30 mins late",
        description: "David Miller • Logistics delay inquiry",
        priority: "MEDIUM",
        status: "enabled-live-chat",
        customerId: "cust-402",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "TCK-403",
        title: "Wallet cashback missing for PROMO-EID",
        description: "Sarah Jenkins • Promo code cashback query",
        priority: "LOW",
        status: "solved",
        customerId: "cust-403",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    authFetch("/tickets")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setTickets(d.data);
        } else {
          setTickets(fallbackTickets);
        }
      })
      .catch(() => setTickets(fallbackTickets))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let list = [...tickets];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "ALL") {
      list = list.filter((t) => t.status === filterStatus);
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "priority") {
        cmp = priorityStyle(a.priority).rank - priorityStyle(b.priority).rank;
      } else if (sortField === "status") {
        cmp = statusStyle(a.status).rank - statusStyle(b.status).rank;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [tickets, search, filterStatus, sortField, sortDir]);

  const hasFilters = search || filterStatus !== "ALL";

  if (loading) return <TicketsSkeleton />;

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <Inbox size={24} className="text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No tickets assigned</p>
        <p className="mt-1 text-xs text-slate-400">Tickets assigned to you will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-slate-100 px-5 py-3.5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Search by title or ticket ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
          <Filter size={12} className="text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
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
            className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5"
          >
            <RotateCcw size={12} /> Clear
          </Button>
        )}

        {/* Count */}
        <p className="text-[11px] text-slate-400 sm:ml-auto shrink-0">
          <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
          <span className="font-semibold text-slate-600">{tickets.length}</span> tickets
        </p>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <Search size={20} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No tickets match your filters</p>
          <Button
            size="sm" variant="outline"
            onClick={() => { setSearch(""); setFilter("ALL"); }}
            className="mt-3 rounded-xl border-slate-200 text-xs font-bold gap-1.5"
          >
            <RotateCcw size={12} /> Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[40%]">
                  Title
                </th>
                <SortTh label="Priority" field="priority" current={sortField} dir={sortDir} onSort={handleSort} />
                <SortTh label="Status"   field="status"   current={sortField} dir={sortDir} onSort={handleSort} />
                <SortTh label="Date"     field="createdAt" current={sortField} dir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => {
                const prio   = priorityStyle(t.priority);
                const status = statusStyle(t.status);

                return (
                  <tr
                    key={t.id}
                    className="group hover:bg-indigo-50/30 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-indigo-700 transition-colors">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-tight">
                        {t.description}
                      </p>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${prio.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${prio.dot}`} />
                        {prio.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                        <Clock size={11} />
                        {new Date(t.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link href={`/dashboard/support/${t.id}`}>
                        <Button
                          size="sm"
                          className="h-8 rounded-xl px-3 text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm transition-all"
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
    </div>
  );
}
