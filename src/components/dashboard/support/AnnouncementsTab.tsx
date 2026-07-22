"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Megaphone, Plus } from "lucide-react";

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState("ALL");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await axios.post("/api/admin/support/announcements", {
        title,
        content,
        targetType,
        startDate: new Date(),
      });
      toast.success("Broadcast announcement created");
      setTitle("");
      setContent("");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to publish announcement");
    }
  };

  if (loading) return <div className="text-slate-400 text-sm font-semibold p-6 text-center">Loading announcements...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Broadcast Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Broadcast Announcement</h3>
        <input
          type="text"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <textarea
          placeholder="Announcement Content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        >
          <option value="ALL">All Users</option>
          <option value="CUSTOMER">Customers Only</option>
          <option value="VENDOR">Vendors Only</option>
          <option value="BRANCH">Branches Only</option>
        </select>
        <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"><Plus size={16} /> Broadcast Notice</button>
      </form>

      {/* Broadcast History */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Broadcast History</h3>
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No announcements published yet.</div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2 flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-1 shrink-0"><Megaphone size={18} /></div>
              <div className="space-y-1">
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100">{ann.targetType}</span>
                <h4 className="font-bold text-slate-800 text-sm">{ann.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{ann.content}</p>
                <span className="text-[10px] text-slate-400 block font-semibold">{new Date(ann.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
