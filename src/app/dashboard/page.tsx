"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerOverview } from "@/components/dashboard/CustomerOverview";
import { SuperAdminOverview } from "@/components/dashboard/overview/SuperAdminOverview";
import { NormalAdminOverview } from "@/components/dashboard/overview/NormalAdminOverview";
import { Download, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.userType?.toUpperCase() === "CUSTOMER") {
    return <CustomerOverview />;
  }

  const role = (user?.userType || (user as any)?.role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const initials = (user?.fullName || "A")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-full space-y-8">

      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 p-6 md:p-8">
          {/* Left: avatar + greeting */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-lg font-extrabold shadow-lg ring-4 ring-indigo-500/20">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-card ring-2 ring-card">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight leading-none">
                  {greeting}, {user?.fullName?.split(" ")[0] || "Admin"}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border
                  ${isSuperAdmin
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                    : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"}`}>
                  {isSuperAdmin
                    ? <ShieldCheck size={12} strokeWidth={2.5} />
                    : <UserCheck size={12} strokeWidth={2.5} />}
                  {isSuperAdmin ? "Super Admin" : "Operational Admin"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{currentDate}</p>
            </div>
          </div>

          {/* Right: action (Super Admin only) */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => toast.success("Platform Executive System Report generated and downloading...")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold
                  shadow-sm hover:shadow-indigo-500/30 hover:shadow-md hover:opacity-95
                  active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Download size={14} strokeWidth={2.5} />
                Generate Report
              </button>
            </div>
          )}

          {isSuperAdmin && (
            <Sparkles size={18} className="absolute top-5 right-5 text-indigo-300/40 hidden sm:block pointer-events-none" />
          )}
        </div>
      </div>

      {/* ── Role-Based Overview ────────────────────────────────────────── */}
      {isSuperAdmin ? <SuperAdminOverview /> : <NormalAdminOverview />}
    </div>
  );
}
