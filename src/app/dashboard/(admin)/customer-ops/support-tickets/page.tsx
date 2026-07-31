"use client";

import React from "react";
import { Headphones, Search, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default function SupportTicketsPage() {
  const tickets = [
    {
      id: "TCK-401",
      customer: "Elena Rostova",
      subject: "Stain on Silk Dress after Dry Clean",
      priority: "HIGH",
      status: "OPEN",
      lastUpdated: "10 Mins ago",
      assignedAgent: "Customer Support Desk",
    },
    {
      id: "TCK-402",
      customer: "David Miller",
      subject: "Delivery Agent arrived 30 mins late",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      lastUpdated: "1 Hour ago",
      assignedAgent: "Logistics Manager",
    },
    {
      id: "TCK-403",
      customer: "Sarah Jenkins",
      subject: "Wallet cashback missing for PROMO-EID",
      priority: "LOW",
      status: "RESOLVED",
      lastUpdated: "Yesterday",
      assignedAgent: "Finance Team",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Headphones className="text-blue-600" />
            Customer Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resolve customer inquiries, order complaints, and refund requests.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tickets by ID or customer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Ticket ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Activity</th>
                <th className="py-3.5 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((tck) => (
                <tr key={tck.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-blue-600">{tck.id}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{tck.customer}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{tck.subject}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        tck.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : tck.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tck.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        tck.status === "OPEN"
                          ? "bg-blue-100 text-blue-800"
                          : tck.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {tck.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">{tck.lastUpdated}</td>
                  <td className="py-4 px-6">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg text-xs hover:bg-blue-100 transition-colors">
                      <MessageSquare size={14} /> Respond
                    </button>
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
