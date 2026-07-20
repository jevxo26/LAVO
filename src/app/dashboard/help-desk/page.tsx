"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Headphones, 
  HelpCircle, 
  PlusCircle, 
  MessageSquare, 
  ChevronDown, 
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

import LiveChatModal from "@/components/dashboard/LiveChatModal";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Assignee {
  id: string;
  fullName: string;
  userType: string;
}

export default function HelpDeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // New ticket state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [assignedTo, setAssignedTo] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // General Chat state (separate from tickets)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRole, setChatRole] = useState<"ADMIN" | "BRANCH_MANAGER" | null>(null);

  const loadData = async () => {
    try {
      // Load tickets
      const ticketsRes = await authFetch("/tickets");
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setTickets(ticketsData.data);
      }

      // Load active assignees
      const assigneesRes = await authFetch("/tickets/assignees");
      const assigneesData = await assigneesRes.json();
      if (assigneesData.success) {
        setAssignees(assigneesData.data);
      }

      // Load FAQs
      const faqsRes = await fetch("/api/customer/faqs");
      const faqsData = await faqsRes.json();
      if (faqsData.success) {
        setFaqs(faqsData.data);
      }
    } catch (err) {
      console.error("Error loading help desk data:", err);
      toast.error("Failed to load help desk details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await authFetch("/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          assignedTo: assignedTo || null
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Support ticket created successfully");
        setTitle("");
        setDescription("");
        setPriority("NORMAL");
        setAssignedTo("");
        setIsDialogOpen(false);
        // Refresh ticket list
        loadData();
      } else {
        toast.error(data.message || "Failed to create support ticket");
      }
    } catch {
      toast.error("Failed to submit support ticket");
    } finally {
      setCreateLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading Help Desk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* Help Desk header and ticket creation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Help Desk & Support</h1>
          <p className="text-slate-500">Contact customer care, file issues, and search frequently asked questions.</p>
        </div>

        {/* Ticket Modal Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold h-11 px-5 shadow-md shadow-indigo-100 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <PlusCircle size={18} /> Open Support Ticket
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue, and assign it to a staff member if desired.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 pt-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs font-bold text-slate-700">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Order delayed, damaged garment, etc."
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="priority" className="text-xs font-bold text-slate-700">Priority Level</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 text-xs border rounded-xl bg-white px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-700"
                >
                  <option value="LOW">Low (General inquiry)</option>
                  <option value="NORMAL">Normal (Standard priority)</option>
                  <option value="HIGH">High (Urgent matter)</option>
                  <option value="URGENT">Urgent (Immediate attention)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="assignedTo" className="text-xs font-bold text-slate-700">Assign to Agent (Optional)</Label>
                <select
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full h-10 text-xs border rounded-xl bg-white px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-700"
                >
                  <option value="">Choose an Admin or Branch Manager</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.userType === 'BRANCH_MANAGER' ? 'Branch Manager' : 'Admin'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs font-bold text-slate-700">Describe the issue</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details like Order Number, issue date, etc."
                  rows={4}
                  required
                  className="w-full text-xs border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={createLoading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 mt-4"
              >
                {createLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Submitting ticket...
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Chat Selection (General live chat feature) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => { setChatRole("ADMIN"); setIsChatOpen(true); }}
          className="cursor-pointer bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Central Support</h3>
              <p className="text-indigo-100 text-sm max-w-[80%]">General inquiries, billing, and system-wide issues.</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-indigo-50">
            Start Live Chat <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => { setChatRole("BRANCH_MANAGER"); setIsChatOpen(true); }}
          className="cursor-pointer bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg shadow-slate-200/50 relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Branch Support</h3>
              <p className="text-slate-300 text-sm max-w-[80%]">Order status, specific laundry requests, and delivery details.</p>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
              <Headphones className="text-white" size={24} />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-300">
            Start Live Chat <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
      
      <LiveChatModal 
        targetRole={chatRole}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Main Grid: Tickets list and FAQ Accordion */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Left column: My Tickets */}
        <Card className="lg:col-span-6 border border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">My Support Tickets</CardTitle>
              <CardDescription className="text-xs">Follow logs of your inquiries and chat with support agents.</CardDescription>
            </div>
            <div className="text-slate-400">
              <MessageSquare size={18} />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No active tickets submitted.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/5 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{t.title}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getPriorityStyle(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusStyle(t.status)}`}>
                          {formatStatus(t.status)}
                        </span>
                        
                        <Link href={`/dashboard/help-desk/${t.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 p-0 flex items-center gap-0.5">
                            Open Chat & Details <ArrowRight size={11} />
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

        {/* Right column: FAQ Accordion */}
        <Card className="lg:col-span-6 border border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-xs">Quick self-help answers updated live by admins.</CardDescription>
            </div>
            <div className="text-slate-400">
              <HelpCircle size={18} />
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {faqs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No FAQs compiled yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {faqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <button
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full flex items-center justify-between text-left font-bold text-slate-800 hover:text-indigo-600 transition-colors py-1.5 text-xs sm:text-sm"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180 text-indigo-600" : ""}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed pt-2 pl-1 bg-indigo-50/10 p-2.5 rounded-lg border border-indigo-50/20">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
