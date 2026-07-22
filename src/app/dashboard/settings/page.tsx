"use client";

import React, { useState } from "react";
import { FeatureFlagTab } from "@/components/dashboard/settings/FeatureFlagTab";
import { FinanceTab } from "@/components/dashboard/settings/FinanceTab";
import { AuditLogTab } from "@/components/dashboard/settings/AuditLogTab";
import { ShieldCheck, ToggleRight, DollarSign, ListFilter } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"flags" | "rules" | "logs">("flags");

  const TABS = [
    { id: "flags" as const, name: "Feature Flags", icon: ToggleRight },
    { id: "rules" as const, name: "Global Rules", icon: DollarSign },
    { id: "logs" as const, name: "Audit Logs", icon: ListFilter },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Governance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage platform feature flags, tax structures, and inspect audit logs.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={18} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === "flags" && <FeatureFlagTab />}
        {activeTab === "rules" && <FinanceTab />}
        {activeTab === "logs" && <AuditLogTab />}
      </div>
    </div>
  );
}
