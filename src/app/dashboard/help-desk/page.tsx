"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  PlusCircle,
  Sparkles,
  Inbox,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

import { Ticket, FAQItem, Assignee } from "@/components/help-desk/types";
import { HelpDeskSkeleton }  from "@/components/help-desk/HelpDeskSkeletons";
import { TicketCard }        from "@/components/help-desk/TicketCard";
import { FAQAccordion }      from "@/components/help-desk/FAQAccordion";
import { NewTicketDialog }   from "@/components/help-desk/NewTicketDialog";

export default function HelpDeskPage() {
  const [tickets, setTickets]             = useState<Ticket[]>([]);
  const [faqs, setFaqs]                   = useState<FAQItem[]>([]);
  const [assignees, setAssignees]         = useState<Assignee[]>([]);
  const [loading, setLoading]             = useState(true);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen]       = useState(false);

  const loadData = async () => {
    try {
      const [ticketsRes, assigneesRes, faqsRes] = await Promise.all([
        authFetch("/tickets"),
        authFetch("/tickets/assignees"),
        fetch("/api/customer/faqs"),
      ]);
      const [tData, aData, fData] = await Promise.all([
        ticketsRes.json(),
        assigneesRes.json(),
        faqsRes.json(),
      ]);
      if (tData.success) setTickets(tData.data);
      if (aData.success) setAssignees(aData.data);
      if (fData.success) setFaqs(fData.data);
    } catch (err) {
      console.error("Error loading help desk data:", err);
      toast.error("Failed to load help desk details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <HelpDeskSkeleton />;

  const openCount   = tickets.filter((t) => t.status !== "solved").length;
  const solvedCount = tickets.filter((t) => t.status === "solved").length;

  return (
    <div className="space-y-7">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">
                Customer Support
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Help Desk</h1>
            <p className="mt-1 text-sm text-indigo-200">
              File issues, chat with support agents, and browse FAQs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {tickets.length > 0 && (
              <>
                <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Open</p>
                  <p className="text-white font-extrabold text-xl leading-tight">{openCount}</p>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Solved</p>
                  <p className="text-white font-extrabold text-xl leading-tight">{solvedCount}</p>
                </div>
              </>
            )}
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 gap-1.5 shadow-sm"
            >
              <PlusCircle size={14} /> New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">

        {/* Tickets panel */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <MessageSquare size={14} className="text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">My Support Tickets</h2>
                <p className="text-[11px] text-slate-400">Track inquiries and chat with agents</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              {tickets.length}
            </span>
          </div>

          <div className="p-5">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <Inbox size={24} className="text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No tickets yet</p>
                <p className="mt-1 text-xs text-slate-400">Open a new ticket if you need help.</p>
                <Button
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
                >
                  <PlusCircle size={12} /> New Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            )}
          </div>
        </div>

        {/* FAQ panel */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <HelpCircle size={14} className="text-violet-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">FAQs</h2>
                <p className="text-[11px] text-slate-400">Quick self-help answers</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              {faqs.length}
            </span>
          </div>

          <div className="px-6 py-2">
            <FAQAccordion
              faqs={faqs}
              expandedId={expandedFaqId}
              onToggle={(id) => setExpandedFaqId(expandedFaqId === id ? null : id)}
            />
          </div>
        </div>
      </div>

      {/* Dialog */}
      <NewTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignees={assignees}
        onCreated={loadData}
      />
    </div>
  );
}
