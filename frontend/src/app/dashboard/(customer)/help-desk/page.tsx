"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  PlusCircle,
  Inbox,
  PhoneCall,
  MessageCircle,
  Headphones,
  ArrowRight,
  Headset,
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
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

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
      toast.error("Failed to load support data");
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
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="24/7 Customer Help & Support Hub"
        title="How Can We Help You Today?"
        description="Create support tickets, chat with assigned agents in real time, and get instant answers from our FAQ library."
        icon={Headset}
        chips={tickets.length > 0 ? [
          { label: "Open Tickets",   value: openCount   },
          { label: "Solved Tickets", value: solvedCount },
        ] : []}
      />

      {/* ── 2. Contact Channels ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WhatsApp */}
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-success/40 transition-all"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success text-white shadow-md group-hover:scale-110 transition-transform">
            <MessageCircle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-card-foreground group-hover:text-success transition-colors">
              WhatsApp Support
            </p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Instant chat on WhatsApp</p>
          </div>
          <ArrowRight size={15} className="text-muted-foreground/40 group-hover:text-success group-hover:translate-x-1 transition-all" />
        </a>

        {/* Hotline */}
        <a
          href="tel:16262"
          className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform"
            style={{ background: "var(--primary)" }}>
            <PhoneCall size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-card-foreground group-hover:text-primary transition-colors">
              Customer Hotline
            </p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Call 16262 (Toll-Free)</p>
          </div>
          <ArrowRight size={15} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </a>

        {/* Submit Ticket */}
        <button
          onClick={() => setDialogOpen(true)}
          className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform"
            style={{ background: "var(--primary)" }}>
            <Headphones size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-card-foreground group-hover:text-primary transition-colors">
              Submit Ticket
            </p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Chat with support team</p>
          </div>
          <ArrowRight size={15} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* ── 3. Tickets + FAQs Grid ───────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">

        {/* Support Tickets */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-card-foreground">My Support Tickets</h2>
                <p className="text-[11px] text-muted-foreground font-medium">Track open tickets &amp; live support chats</p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black"
              style={{ color: "var(--primary)" }}>
              {tickets.length} Tickets
            </span>
          </div>

          <div className="p-5">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10"
                  style={{ color: "var(--primary)" }}>
                  <Inbox size={28} />
                </div>
                <p className="text-base font-black text-card-foreground">No active tickets</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs font-medium">
                  Have an issue with an order or payment? Submit a new ticket and our team will respond right away.
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="mt-5 h-10 px-5 rounded-xl text-white text-xs font-black gap-2 shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
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

        {/* FAQs */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10"
              style={{ color: "var(--secondary)" }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-card-foreground">Frequently Asked Questions</h2>
              <p className="text-[11px] text-muted-foreground font-medium">Instant self-help &amp; laundry guides</p>
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

      <NewTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignees={assignees}
        onCreated={loadData}
      />
    </motion.div>
  );
}
