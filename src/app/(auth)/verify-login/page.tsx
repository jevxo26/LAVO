"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  ShieldCheck,
  MapPin,
  ArrowLeft,
  BadgeCheck,
  Smartphone,
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VerifyOTPForm } from "@/components/auth/verify-otp";
import { Loader2 } from "lucide-react";

// ── Helper: mask phone number for privacy display ─────────────────────────────
function maskPhone(phone: string): string {
  if (!phone) return "your phone number";
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length <= 4) return cleaned;
  // Show first 4 chars and last 2 chars, mask the middle
  return cleaned.slice(0, 4) + "*".repeat(Math.max(0, cleaned.length - 6)) + cleaned.slice(-2);
}

// ── Inner content (uses useSearchParams — must be inside Suspense) ─────────────
function VerifyContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const maskedPhone = maskPhone(phone);

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid min-h-screen lg:grid-cols-2"
      >
        {/* ── Left Panel ─────────────────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white relative overflow-hidden">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link href="/">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">LAUNDRIX</h1>
              </div>
            </Link>

            <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold">
              🔐 Secure Phone Verification
            </div>

            <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur border border-white/15">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">
                Why we verify your phone?
              </p>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> Protect your account from unauthorized access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> Receive live order alerts & OTP confirmations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> Your code expires in 1 minute for safety
                </li>
              </ul>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="mb-3 text-4xl font-bold">Verify your number</h2>
            <p className="mb-8 text-blue-100 leading-relaxed">
              A 6-digit code was sent to <span className="font-bold text-white">{maskedPhone}</span>.
              Enter it below to activate your LAUNDRIX account.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Feature icon={<ShieldCheck size={16} />} text="Secure Verification" />
              <Feature icon={<Activity size={16} />}   text="60-Second Code" />
              <Feature icon={<Building2 size={16} />}  text="Enterprise Ready" />
              <Feature icon={<MapPin size={16} />}     text="Bangladesh SMS" />
            </div>

            <div className="mt-10 text-xs text-slate-300">
              © 2026 LAUNDRIX Technologies Ltd.
            </div>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center p-8 lg:p-14 bg-slate-50">
          <div className="w-full max-w-md">

            <Link
              href="/register"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Register
            </Link>

            {/* Step indicator */}
            <div className="mb-8 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <BadgeCheck className="h-5 w-5 fill-emerald-600 text-white" />
                <span className="font-medium">Sign Up</span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                2
              </div>
              <span className="font-semibold text-blue-600">Verify</span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Verify your phone</h2>
                <p className="mt-2 text-sm text-slate-500">
                  We sent a 6-digit code to
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800 tracking-widest">
                  {maskedPhone}
                </p>
              </div>

              <VerifyOTPForm />
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page export (Suspense boundary for useSearchParams) ───────────────────────
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={30} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur border border-white/10">
      {icon}
      <span>{text}</span>
    </div>
  );
}