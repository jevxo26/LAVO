"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Megaphone, Plus, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AnnouncementsCMSPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/website-cms/announcements").then(r => r.json());
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateNew = () => {
    toast.success("Created new promotional banner draft!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" />
            Active Website Announcements & Promo Banners
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast promotional banners, app notifications, and system alerts to visitors.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus size={14} /> New Announcement Banner
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Banner Title</th>
                <th className="py-3.5 px-6">Message Content</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Active Period</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{a.title}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{a.content}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-800">
                      {a.bannerType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    {a.startDate} to {a.endDate}
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
