"use client";

import React from "react";
import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 bg-red-50 text-red-600 rounded-3xl border border-red-100 shadow-sm">
        <ShieldX size={48} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403 — Unauthorized Access</h1>
      <p className="text-slate-500 text-sm max-w-md leading-relaxed">
        Your administrator role does not possess the granular permissions required to access this resource. Please contact a Super Admin if you require role elevation.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
}
