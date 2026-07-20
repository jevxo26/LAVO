"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare, ArrowRight, Loader2, ClipboardList } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { SupportTables } from "@/components/support/Table";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  customerId: string;
  createdAt: string;
}

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignedTickets = async () => {
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "enabled-live-chat":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "solved":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "pendingReview":
        return "Pending Review";
      case "enabled-live-chat":
        return "Live Chat Active";
      case "solved":
        return "Solved";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Support Operations</h1>
        <p className="text-slate-500">Manage assigned customer support tickets and live chats.</p>
      </div>

      {/* Assigned Tickets Dashboard */}
      <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between p-6">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Tickets Assigned to Me</CardTitle>
            <CardDescription className="text-xs">Follow progress and chat with customers on tickets assigned to you.</CardDescription>
          </div>
          <div className="text-indigo-600 bg-indigo-50 p-2 rounded-xl">
            <ClipboardList size={20} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={28} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No tickets currently assigned to you.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/20 transition-all flex flex-col justify-between gap-4">
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
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getStatusStyle(t.status)}`}>
                        {formatStatus(t.status)}
                      </span>
                      
                      <Link href={`/dashboard/support/${t.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 p-2 flex items-center gap-1 cursor-pointer">
                          Open Chat <ArrowRight size={12} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legacy Support Tables & Chat (only for Admin) */}
      <SupportTables />
    </div>
  );
}
