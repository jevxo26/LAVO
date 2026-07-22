"use client";

import React, { useState } from "react";
import { VendorTable } from "@/components/vendors/Table";
import { PendingVerifications } from "@/components/dashboard/vendors/PendingVerifications";
import { PayoutRequests } from "@/components/dashboard/vendors/PayoutRequests";
import { useAuth } from "@/hooks/useAuth";
import { Users, ShieldAlert, DollarSign, PackageCheck } from "lucide-react";

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "payouts">("all");
  const { user } = useAuth();

  const isPlatformAdmin = user && ["SUPER_ADMIN", "ADMIN"].includes(user.userType?.toUpperCase());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <PackageCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor & Partner Governance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Approve incoming vendor applications, verify files, and manage payout clearings.</p>
        </div>
      </div>

      {/* Tabs */}
      {isPlatformAdmin && (
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users size={18} /> Active Vendors
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShieldAlert size={18} /> Pending Audit
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "payouts" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <DollarSign size={18} /> Payout Clearance
          </button>
        </div>
      )}

      {/* Panel Render */}
      <div className="mt-4">
        {activeTab === "all" && <VendorTable />}
        {isPlatformAdmin && activeTab === "pending" && <PendingVerifications />}
        {isPlatformAdmin && activeTab === "payouts" && <PayoutRequests />}
      </div>
    </div>
  );
}
