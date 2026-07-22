"use client";

import React, { useState } from "react";
import { SupportTicketsTab } from "@/components/dashboard/support/SupportTicketsTab";
import { ReviewModerationTab } from "@/components/dashboard/support/ReviewModerationTab";
import { AnnouncementsTab } from "@/components/dashboard/support/AnnouncementsTab";
import { SupportTables } from "@/components/support/Table";
import { useAuth } from "@/hooks/useAuth";
import { Headphones, Ticket, Star, Megaphone } from "lucide-react";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "reviews" | "announcements">("tickets");
  const { user } = useAuth();
  
  const isPlatformAdmin = user && ["SUPER_ADMIN", "ADMIN"].includes(user.userType?.toUpperCase());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Headphones size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support & Moderation Operations</h1>
          <p className="text-slate-400 text-sm mt-0.5">Solve assigned support tickets, moderate feedback ratings, and broadcast announcements.</p>
        </div>
      </div>

      {/* Tabs */}
      {isPlatformAdmin && (
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "tickets" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Ticket size={18} /> Support Tickets
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "reviews" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Star size={18} /> Review Moderation
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "announcements" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Megaphone size={18} /> Announcements
          </button>
        </div>
      )}

      {/* Render Panel */}
      <div className="mt-4">
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <SupportTicketsTab />
            {isPlatformAdmin && <SupportTables />}
          </div>
        )}
        {isPlatformAdmin && activeTab === "reviews" && <ReviewModerationTab />}
        {isPlatformAdmin && activeTab === "announcements" && <AnnouncementsTab />}
      </div>
    </div>
  );
}
