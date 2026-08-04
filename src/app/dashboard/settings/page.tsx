"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, CircleDollarSign, Landmark, Sliders, Bell } from "lucide-react";
import { PersonalPreferences } from "@/components/settings/PersonalPreferences";
import Link from "next/link";

export default function GenericSettingsPage() {
  const [activeTab, setActiveTab] = useState<"preferences" | "system">("preferences");
  const [userRole, setUserRole] = useState<string>("CUSTOMER");

  useEffect(() => {
    try {
      const token = localStorage.getItem("laundrix_token");
      if (token) {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          const rawRole = payload?.role || payload?.userType || "CUSTOMER";
          setUserRole(rawRole.toUpperCase().replace(/\s+/g, "_"));
        }
      }
    } catch {
      setUserRole("CUSTOMER");
    }
  }, []);

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="text-blue-600" /> Platform & Personal Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal alert preferences and view platform configuration.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 uppercase">
          {userRole}
        </span>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === "preferences"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Bell size={18} />
          Personal Preferences
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "system"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <ShieldCheck size={18} />
            System Administration
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "preferences" && <PersonalPreferences />}

        {activeTab === "system" && isSuperAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/system-settings/pricing-tax"
              className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <CircleDollarSign size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pricing & Tax Rules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure delivery base fee, express multipliers, and global VAT tax rates.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mt-4">
                Configure Pricing &rarr;
              </span>
            </Link>

            <Link
              href="/dashboard/system-settings/financial-rules"
              className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Landmark size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Financial Rules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set vendor commission percentages and minimum payout thresholds.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-4">
                Configure Finance &rarr;
              </span>
            </Link>

            <Link
              href="/dashboard/system-settings/feature-flags"
              className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Sliders size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Feature Flags</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Toggle wallet cashback, promo codes, SMS gateway, and vendor marketplace modules.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4">
                Manage Feature Flags &rarr;
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
