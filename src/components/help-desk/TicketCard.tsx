import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ticket, priorityStyle, statusStyle } from "./types";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const prio   = priorityStyle(ticket.priority);
  const status = statusStyle(ticket.status);

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-4 transition-all duration-150 hover:border-indigo-100 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">

        {/* Left */}
        <div className="min-w-0 space-y-2">
          <h3 className="text-[13px] font-bold text-slate-900 leading-snug">{ticket.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${prio.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${prio.dot}`} />
              {prio.label}
            </span>
            {/* Date */}
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={11} />
              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <Link href={`/dashboard/help-desk/${ticket.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-2.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 gap-1"
            >
              Open Chat <ArrowRight size={11} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
