"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Loader2,
  ClipboardList,
  TicketCheck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  customerId: string;
  customerName?: string;
  createdAt: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-slate-50 text-slate-600 border-slate-200",
  NORMAL: "bg-slate-50 text-slate-600 border-slate-200",
};

const STATUS_META: Record<string, { label: string; style: string; icon: React.ElementType }> = {
  pendingReview: {
    label: "Pending Review",
    style: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Timer,
  },
  "enabled-live-chat": {
    label: "Chat Active",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: MessageCircle,
  },
  solved: {
    label: "Solved",
    style: "bg-slate-100 text-slate-600 border-slate-200",
    icon: CheckCircle2,
  },
};

function TicketCard({ ticket }: { ticket: Ticket }) {
  const priority = ticket.priority.toUpperCase();
  const statusKey = ticket.status as keyof typeof STATUS_META;
  const status = STATUS_META[statusKey] ?? { label: ticket.status, style: "bg-slate-100 text-slate-600 border-slate-200", icon: AlertCircle };
  const StatusIcon = status.icon;

  return (
    <div className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/30">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <ClipboardList size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[priority] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
              {ticket.priority}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.style}`}>
              <StatusIcon size={9} />
              {status.label}
            </span>
          </div>
          <h3 className="truncate text-sm font-bold text-slate-900">{ticket.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{ticket.description}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock size={11} />
          <span>{new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <Link href={`/dashboard/support/${ticket.id}`}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-lg px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Open Chat <ArrowRight size={12} className="ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignedTickets = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/tickets");
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTickets();
  }, []);

  const pending = tickets.filter((t) => t.status === "pendingReview").length;
  const active = tickets.filter((t) => t.status === "enabled-live-chat").length;
  const solved = tickets.filter((t) => t.status === "solved").length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Customer Support</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage support tickets assigned to you, enable live chat, and mark issues as resolved.
        </p>
      </div>

      {/* Stat cards */}
      {!loading && tickets.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Assigned" value={tickets.length} icon={TicketCheck} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Pending Review" value={pending} icon={Timer} color="bg-amber-50 text-amber-600" />
          <StatCard label="Chat Active" value={active} icon={MessageCircle} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Solved" value={solved} icon={CheckCircle2} color="bg-slate-100 text-slate-600" />
        </div>
      )}

      {/* Tickets Assigned to Me */}
      <Card className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/40 px-6 py-5">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Tickets Assigned to Me</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Follow up and chat with customers on tickets assigned to you.
            </CardDescription>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ClipboardList size={18} />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <TicketCheck size={26} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No tickets assigned to you</p>
              <p className="mt-1 text-xs text-slate-400">New assignments will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tickets.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
