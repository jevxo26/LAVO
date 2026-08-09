"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Smartphone,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft,
  Loader2,
  Edit2
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VerifyOTPForm } from "@/components/auth/verify-otp";

// ── Helper: mask phone number for privacy display ─────────────────────────────
function maskPhone(phone: string): string {
  if (!phone) return "+880 1***-***78";
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length <= 5) return cleaned;
  return cleaned.slice(0, 4) + " •••• ••" + cleaned.slice(-2);
}

// ── Inner content (uses useSearchParams — must be inside Suspense) ─────────────
function VerifyContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const maskedPhone = maskPhone(phone);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0F172A] p-4 sm:p-6 overflow-hidden">
      {/* ── Dynamic Ambient Background Lights ────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-sky-500/15 blur-[120px]" />
        {/* Subtle SVG Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* ── Main Container Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Top Logo / Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              LAUNDRIX
            </span>
          </Link>
        </div>

        {/* Card Body */}
        <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 p-6 sm:p-10 shadow-2xl shadow-slate-950/50">
          
          {/* Header Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              <Shield className="h-3.5 w-3.5 fill-blue-600/20 text-blue-600" />
              <span>Identity Verification</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
              We sent a 6-digit verification code via SMS to
            </p>
            
            {/* Phone Badge */}
            <div className="pt-1 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-900 font-bold text-sm tracking-wide shadow-inner">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span>{maskedPhone}</span>
                <Link
                  href="/register"
                  title="Change Phone Number"
                  className="ml-1 p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Form */}
          <VerifyOTPForm />
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center space-y-2 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-slate-500" />
            <span>Need help? Contact support@laundrix.com</span>
          </p>
          <p>© 2026 LAUNDRIX. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page Export with Suspense boundary ───────────────────────────────────────
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-[#0F172A] items-center justify-center">
          <Loader2 size={36} className="animate-spin text-blue-500" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}