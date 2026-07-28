"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  Star,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";
import { VerifyOTPForm } from "@/components/auth/verify-otp";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid min-h-screen lg:grid-cols-2"
      >
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white">
          <div>
            <Link href="/">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <QrCode className="h-6 w-6" />
                </div>

                <h1 className="text-3xl font-bold">
                  LAUNDRIX
                </h1>
              </div>
            </Link>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-blue-100">
                  Platform Overview
                </span>

                <span className="text-xs text-green-300">
                  ● All Systems Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Package size={14} />}
                  title="Active Orders"
                  value="1,521"
                  status="+12%"
                />

                <StatCard
                  icon={<Building2 size={14} />}
                  title="Branch Network"
                  value="280+"
                  status="Live"
                />

                <StatCard
                  icon={<Star size={14} />}
                  title="Satisfaction"
                  value="98.7%"
                  status="↑0.3"
                />

                <StatCard
                  icon={<MapPin size={14} />}
                  title="Cities Served"
                  value="42"
                  status="Expanding"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <QrCode size={20} />
                </div>

                <div>
                  <p className="text-sm text-blue-100">
                    Live QR Tracking
                  </p>

                  <h4 className="font-semibold">
                    #LX-8821 · In Washing
                  </h4>
                </div>
              </div>

              <div className="flex items-end gap-1">
                <div className="h-3 w-1 rounded bg-green-400"></div>
                <div className="h-5 w-1 rounded bg-green-400"></div>
                <div className="h-7 w-1 rounded bg-green-400"></div>
                <div className="h-6 w-1 rounded bg-green-400"></div>
                <div className="h-4 w-1 rounded bg-green-400"></div>
              </div>
            </div>

            <div className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-1 text-xs">
              Secure Verification
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-4xl font-bold">
              Verify your account
            </h2>

            <p className="mb-8 text-blue-100">
              Enter the verification code sent to your email to activate your
              LAUNDRIX account securely.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Feature
                icon={<ShieldCheck size={16} />}
                text="Secure Verification"
              />

              <Feature
                icon={<Activity size={16} />}
                text="Fast Activation"
              />

              <Feature
                icon={<Building2 size={16} />}
                text="Enterprise Ready"
              />

              <Feature
                icon={<MapPin size={16} />}
                text="Global Access"
              />
            </div>

            <div className="mt-10 text-xs text-slate-300">
              © 2026 LAUNDRIX Technologies Ltd.
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-8 lg:p-14">
          <div className="w-full max-w-md">

            <Link
              href="/register"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            {/* Step */}
            <div className="mb-8 flex items-center gap-3 text-sm">

              <div className="flex items-center gap-2 text-emerald-600">
                <BadgeCheck className="h-5 w-5 fill-emerald-600 text-white" />
                <span>Sign Up</span>
              </div>

              <div className="h-px flex-1 bg-slate-200"></div>

              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                2
              </div>

              <span className="font-medium text-blue-600">
                Verify
              </span>
            </div>

            <h2 className="text-4xl font-bold text-slate-900">
              Verify your identity
            </h2>

            <p className="mt-2 text-slate-500">
              We sent a 6-digit code to
            </p>

            <p className="mb-8 font-medium text-slate-700">
              md23450*****@gmail.com
            </p>

            <VerifyOTPForm />

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-blue-100">
        {icon}
        <span>{title}</span>
      </div>

      <h3 className="mt-3 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-1 text-xs font-medium text-emerald-300">
        {status}
      </p>
    </div>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}