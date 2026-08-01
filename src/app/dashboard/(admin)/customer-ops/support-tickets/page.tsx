"use client";

import React from "react";
import { Headphones } from "lucide-react";
import { SupportTicketsTab } from "@/components/dashboard/(admin)/support/SupportTicketsTab";

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Headphones className="text-blue-600" />
            Customer Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resolve customer inquiries, order complaints, and refund requests in real time.
          </p>
        </div>
      </div>

      <SupportTicketsTab />
    </div>
  );
}
