"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  customerId: string;
  createdAt: string;
}

export function SupportTicketsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignedTickets = async () => {
    try {
      const res = await authFetch("/tickets");
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch {
      toast.error("Failed to load assigned support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTickets();
  }, []);

  const getPriorityStyle = (prio: string) => {
    switch (prio.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return <div className="text-center py-12 text-slate-400 text-sm">No tickets currently assigned to you.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tickets.map((t) => (
        <div key={t.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-md hover:shadow-blue-50/20 transition-all flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{t.title}</h3>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${getPriorityStyle(t.priority)}`}>
                {t.priority}
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{t.description}</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <Clock size={11} /> {new Date(t.createdAt).toLocaleDateString()}
            </span>
            <Link href={`/dashboard/support/${t.id}`}>
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 p-2 flex items-center gap-1 cursor-pointer">
                Open Chat <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
