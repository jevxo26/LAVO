"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Megaphone, Plus, Loader2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function AnnouncementsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Sk className="lg:col-span-5 h-72 rounded-2xl" />
      <div className="lg:col-span-7 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 flex gap-4">
            <Sk className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-3 w-16 rounded-full" />
              <Sk className="h-4 w-48" />
              <Sk className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Target badge ─────────────────────────────────────────────────────────────

function TargetBadge({ type }: { type: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ALL:      { cls: "bg-indigo-50 text-indigo-700 border-indigo-200",   label: "All Users"  },
    CUSTOMER: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Customers"  },
    VENDOR:   { cls: "bg-violet-50 text-violet-700 border-violet-200",    label: "Vendors"    },
    BRANCH:   { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "Branches"   },
  };
  const { cls, label } = map[type] ?? map.ALL;
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [targetType, setTarget] = useState("ALL");
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("/api/admin/support/announcements");
      setAnnouncements(res.data.data || []);
    } catch {
      toast.error("Failed to load announcements list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      await axios.post("/api/admin/support/announcements", {
        title, content, targetType, startDate: new Date(),
      });
      toast.success("Broadcast announcement published");
      setTitle(""); setContent("");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to publish announcement");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AnnouncementsSkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ── Broadcast form ─────────────────────────────────────────────── */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Radio size={14} className="text-indigo-500" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">Broadcast Announcement</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Title</Label>
            <input
              type="text"
              placeholder="Announcement title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Content</Label>
            <textarea
              placeholder="Announcement content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Target Audience</Label>
            <select
              value={targetType}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="ALL">All Users</option>
              <option value="CUSTOMER">Customers Only</option>
              <option value="VENDOR">Vendors Only</option>
              <option value="BRANCH">Branches Only</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 gap-2"
          >
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> Publishing…</>
              : <><Plus size={14} /> Broadcast Notice</>}
          </Button>
        </form>
      </div>

      {/* ── History ────────────────────────────────────────────────────── */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Megaphone size={14} className="text-violet-500" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Broadcast History</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            {announcements.length}
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                <Megaphone size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No announcements yet</p>
              <p className="mt-1 text-xs text-slate-400">Published notices will appear here.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <Megaphone size={15} className="text-indigo-500" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <TargetBadge type={ann.targetType} />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(ann.startDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 leading-snug">{ann.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
