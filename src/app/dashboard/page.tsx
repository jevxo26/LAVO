"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerOverview } from "@/components/dashboard/CustomerOverview";
import { SuperAdminOverview } from "@/components/dashboard/overview/SuperAdminOverview";
import { NormalAdminOverview } from "@/components/dashboard/overview/NormalAdminOverview";
import { Calendar, Download, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();

  // Customer view fallback
  if (user?.userType?.toUpperCase() === "CUSTOMER") {
    return <CustomerOverview />;
  }

  const role = (user?.userType || (user as any)?.role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleGenerateReport = () => {
    toast.success("Platform Executive System Report generated and downloading...");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 bg-background text-foreground min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back, {user?.fullName || "Admin"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-foreground border border-border">
              {isSuperAdmin ? <ShieldCheck size={14} className="text-primary" /> : <UserCheck size={14} className="text-muted-foreground" />}
              {isSuperAdmin ? "Super Admin" : "Operational Admin"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Calendar size={14} />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Quick Action Button: Visible ONLY to SUPER_ADMIN */}
        {isSuperAdmin && (
          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Download size={15} />
            Generate Report
          </button>
        )}
      </div>

      {/* Role-Based Overview Component */}
      {isSuperAdmin ? <SuperAdminOverview /> : <NormalAdminOverview />}
    </div>
  );
}
