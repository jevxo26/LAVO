"use client";

import { useState } from "react";
import { Loader2, TicketCheck } from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Assignee } from "./types";

interface NewTicketDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assignees: Assignee[];
  onCreated: () => void;
}

export function NewTicketDialog({ open, onOpenChange, assignees, onCreated }: NewTicketDialogProps) {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [priority, setPriority]     = useState("NORMAL");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setLoading(true);
    try {
      const res  = await authFetch("/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          assignedTo: assignedTo || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Support ticket created successfully");
        setTitle(""); setDesc(""); setPriority("NORMAL"); setAssignedTo("");
        onOpenChange(false);
        onCreated();
      } else {
        toast.error(data.message || "Failed to create support ticket");
      }
    } catch {
      toast.error("Failed to submit support ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
              <TicketCheck size={15} className="text-indigo-600" />
            </div>
            Create Support Ticket
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Describe your issue and optionally assign it to a staff member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-title" className="text-xs font-bold text-slate-700">Title</Label>
            <Input
              id="ticket-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Order delayed, damaged garment…"
              required
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ticket-priority" className="text-xs font-bold text-slate-700">Priority</Label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 text-xs border border-input rounded-xl bg-white px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-700"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-assignee" className="text-xs font-bold text-slate-700">Assign to (optional)</Label>
              <select
                id="ticket-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-10 text-xs border border-input rounded-xl bg-white px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-700"
              >
                <option value="">Auto-assign</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} · {a.userType === "BRANCH_MANAGER" ? "Manager" : "Admin"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-desc" className="text-xs font-bold text-slate-700">Description</Label>
            <textarea
              id="ticket-desc"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Include order number, date, and details of the issue…"
              rows={4}
              required
              className="w-full text-xs border border-input rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 gap-2"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : <><TicketCheck size={14} /> Submit Ticket</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
