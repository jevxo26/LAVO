"use client";

import { AdminCrudPage } from "@/components/shared/admin-crud";
import { branchEmployeeConfig } from "@/components/dashboard/(branch-manager)/employeesConfig";
import { Users, Sparkles } from "lucide-react";

export default function BranchEmployeesPage() {
  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={13} className="text-violet-200" />
            <span className="text-violet-200 text-[11px] font-semibold uppercase tracking-widest">
              Branch Manager Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Users size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Branch Employees</h1>
              <p className="mt-0.5 text-sm text-violet-100">Manage branch staff, designations, and operational personnel.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CRUD ──────────────────────────────────────────────────────────── */}
      <AdminCrudPage config={branchEmployeeConfig} hideHeader />
    </div>
  );
}
