"use client";

import Link from "next/link";
import { Clock, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ticket, priorityStyle, statusStyle } from "./types";
import { motion } from "framer-motion";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const prio   = priorityStyle(ticket.priority);
  const status = statusStyle(ticket.status);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4.5 transition-all duration-200 hover:border-indigo-200 hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
    >
      <div className="flex items-start justify-between gap-4">

        {/* Left Info */}
        <div className="min-w-0 space-y-2">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
            {ticket.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${prio.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${prio.dot}`} />
              {prio.label}
            </span>
            {/* Date */}
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock size={12} />
              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${status.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <Link href={`/dashboard/help-desk/${ticket.id}`}>
            <Button
              className="h-8 px-3.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-extrabold text-xs gap-1.5 transition-all dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              <MessageSquare size={13} /> Open Chat
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
