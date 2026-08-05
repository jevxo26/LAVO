"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  PlusCircle,
  Sparkles,
  Inbox,
  PhoneCall,
  MessageCircle,
  Headphones,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";

import { Ticket, FAQItem, Assignee } from "@/components/dashboard/(customer)/help-desk/types";
import { HelpDeskSkeleton }  from "@/components/dashboard/(customer)/help-desk/HelpDeskSkeletons";
import { TicketCard }        from "@/components/dashboard/(customer)/help-desk/TicketCard";
import { FAQAccordion }      from "@/components/dashboard/(customer)/help-desk/FAQAccordion";
import { NewTicketDialog }   from "@/components/dashboard/(customer)/help-desk/NewTicketDialog";

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
      if (fData.success && Array.isArray(fData.data)) setFaqs(fData.data);
    } catch (err) {
      console.error("Error loading help desk data:", err);
      toast.error("Failed to load support telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <HelpDeskSkeleton />;

  const openCount   = tickets.filter((t) => t.status !== "solved").length;
  const solvedCount = tickets.filter((t) => t.status === "solved").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Support Command Hero Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-blue-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-300" />
              <span className="text-cyan-200 text-xs font-black uppercase tracking-widest">
                24/7 Customer Help &amp; Support Hub
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              How Can We Help You Today?
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              Create support tickets, chat with assigned agents in real time, and get instant answers from our FAQ library.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {tickets.length > 0 && (
              <>
                <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                  <p className="text-cyan-200 text-[10px] font-black uppercase tracking-wider">Open</p>
                  <p className="text-white font-black text-2xl mt-0.5">{openCount}</p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                  <p className="text-cyan-200 text-[10px] font-black uppercase tracking-wider">Solved</p>
                  <p className="text-white font-black text-2xl mt-0.5">{solvedCount}</p>
                </div>
              </>
            )}

            <Button
              onClick={() => setDialogOpen(true)}
              className="h-11 px-6 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-lg gap-2 transition-all hover:scale-[1.02]"
            >
              <PlusCircle size={16} /> Create Support Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Direct Support Contact Channels ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WhatsApp Direct */}
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/70 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <MessageCircle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              WhatsApp Support
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Instant chat on WhatsApp
            </p>
          </div>
          <ArrowRight size={15} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </a>

        {/* 24/7 Hotline */}
        <a
          href="tel:16262"
          className="group flex items-center gap-4 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-white to-cyan-50/70 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <PhoneCall size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Customer Hotline
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Call 16262 (Toll-Free)
            </p>
          </div>
          <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </a>

        {/* Submit Ticket */}
        <button
          onClick={() => setDialogOpen(true)}
          className="group flex items-center gap-4 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-white to-cyan-50/70 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Headphones size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Submit Ticket
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Chat with support team
            </p>
          </div>
          <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* ── 3. Main Grid: Support Tickets + Interactive FAQs ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">

        {/* Support Tickets Panel */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">My Support Tickets</h2>
                <p className="text-[11px] text-slate-400 font-medium">Track open tickets &amp; live support chats</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-300">
              {tickets.length} Tickets
            </span>
          </div>

          <div className="p-5">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-500 dark:bg-blue-950/50">
                  <Inbox size={28} />
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white">No active tickets</p>
                <p className="mt-1 text-xs text-slate-400 max-w-xs font-medium">
                  Have an issue with an order or payment? Submit a new ticket and our team will respond right away.
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="mt-5 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black gap-2 shadow-lg shadow-blue-600/20"
                >
                  <PlusCircle size={15} /> Create First Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
              </div>
            )}
          </div>
        </div>

        {/* Interactive FAQs Panel */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
                <HelpCircle size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                <p className="text-[11px] text-slate-400 font-medium">Instant self-help &amp; laundry guides</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <FAQAccordion
              faqs={faqs}
              expandedId={expandedFaqId}
              onToggle={(id) => setExpandedFaqId(expandedFaqId === id ? null : id)}
            />
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      <NewTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignees={assignees}
        onCreated={loadData}
      />
    </motion.div>
  );
}
