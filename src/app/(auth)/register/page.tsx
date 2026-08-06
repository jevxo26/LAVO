"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Package, QrCode, ShieldCheck, Star, UserPlus, Activity, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-white ">
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid min-h-screen lg:grid-cols-2"
            >
                {/* LEFT SIDE */}
                <div
                    className="
                        hidden lg:flex flex-col justify-between
                        bg-gradient-to-br
                        from-primary
                        via-primary
                        to-secondary
                        p-10
                        text-primary-foreground
                        border-r border-border
                        relative overflow-hidden
                    "
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-between ">
                        <div className="space-y-4">
                            <Link href="/">
                                <div className="flex items-center gap-3 m-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>

                                    <h1 className="text-3xl font-bold">LAUNDRIX</h1>
                                </div>
                            </Link>
                            <div className="mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur">
                                Secure Sign Up
                            </div>
                            <div>
                                <h2 className="mb-1 text-4xl font-bold leading-tight">
                                    Welcome back to LAUNDRIX
                                </h2>

                                <p className="mb-8 max-w-md text-white/80 leading-7">
                                    Your intelligent laundry operating system — managing thousands of
                                    orders with ease.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-white/10 p-3">
                                        <Activity size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm text-blue-100">
                                            Platform Status
                                        </p>

                                        <h4 className="font-semibold">
                                            All systems operating normally
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

                            <div >
                                <div className="grid grid-cols-2 gap-3">
                                    <Feature icon={<ShieldCheck size={16} />} text="Secure Access" />
                                    <Feature icon={<Activity size={16} />} text="Live Order Updates" />
                                    <Feature icon={<Building2 size={16} />} text="Branch Management" />
                                    <Feature icon={<Package size={16} />} text="Order Tracking" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-left text-xs text-white">
                            © 2026 LAUNDRIX Technologies Ltd.
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex min-h-screen my-2 items-center justify-center bg-slate-50 px-6">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="mb-8 text-center mx-auto">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                                <UserPlus className="h-6 w-6 text-success" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
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

                        <div className="flex items-start justify-center overflow-y-auto">

                            <SignUpForm />
                        </div>
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
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-sm">
            {icon}
            <span>{text}</span>
        </div>
    );
}