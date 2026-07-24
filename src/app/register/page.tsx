"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Package, QrCode, ShieldCheck, Star, UserPlus, Activity } from "lucide-react";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-white">
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid min-h-screen lg:grid-cols-2"
            >
                {/* LEFT SIDE */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white">
                    <div>
                        <Link href="/">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                    <QrCode className="h-6 w-6" />
                                </div>

                                <h1 className="text-3xl font-bold">LAUNDRIX</h1>
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
                                    title="Satisfaction Network"
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
                            Secure Sign Up
                        </div>
                    </div>

                    <div >
                        <h2 className="mb-3 text-4xl font-bold">
                            Welcome to LAUNDRIX
                        </h2>

                        <p className="mb-8 text-blue-100">
                            Your intelligent laundry operating system — managing thousands of
                            orders with ease.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Feature icon={<ShieldCheck size={16} />} text="Bank Grade Encryption" />

                            <Feature icon={<Activity size={16} />} text="99.9% Uptime" />

                            <Feature icon={<Building2 size={16} />} text="SOC 2 Compliant" />

                            <Feature icon={<MapPin size={16} />} text="42 Cities Covered" />
                        </div>
                    </div>
                    <div className="mt-10 text-left text-xs text-slate-400">
                        © 2026 LAUNDRIX Technologies Ltd.
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center justify-center p-8 lg:p-14">
                    <div className="w-full max-w-md text-left">
                        <div className="mb-8">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                                <UserPlus className="h-8 w-8 text-green-600" />
                            </div>

                            <h2 className="text-4xl font-bold text-slate-900">
                                Sign up to LAUNDRIX
                            </h2>

                            <p className="mt-2 text-slate-500">
                                Already have one?
                                <Link href="/login">
                                    <span className="ml-2 font-medium text-blue-600 hover:underline">
                                        Sign in
                                    </span>
                                </Link>
                            </p>
                        </div>

                        {/* Account Type */}
                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-medium text-slate-700">
                                Account Type
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="rounded-xl border border-blue-500 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600"
                                >
                                    Customer
                                </button>

                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:border-blue-300"
                                >
                                    Corporate
                                </button>

                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:border-blue-300"
                                >
                                    Branch Partner
                                </button>

                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:border-blue-300"
                                >
                                    Vendor Partner
                                </button>
                            </div>
                        </div>

                        {/* Existing Form */}
                        <SignUpForm />
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

            <h3 className="mt-3 text-3xl font-bold">{value}</h3>

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