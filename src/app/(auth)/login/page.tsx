"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { SignInForm } from "@/components/auth/signin";
import {
    Activity,
    ShieldCheck,
    Building2,
    MapPin,
    QrCode,
    Star,
    Package,
    Lock,
    ShoppingBag,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("laundrix_token");

        if (token) {
            // Sync cookie for Next.js middleware
            document.cookie = `laundrix_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

            const redirectParam = searchParams.get("redirect");
            const statusParam = searchParams.get("status");

            let target = redirectParam || "/dashboard";
            if (statusParam && !target.includes("status=")) {
                target += target.includes("?") ? `&status=${statusParam}` : `?status=${statusParam}`;
            }

            router.replace(target);
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-white">
            <div
                className="grid min-h-screen lg:grid-cols-2"
            >
                {/* Left Side */}
                <div className="
                        relative hidden min-h-screen overflow-hidden
                        bg-gradient-to-br
                        from-blue-50
                        via-white
                        to-cyan-50
                        text-slate-900
                        lg:flex
                    "
                >
                    {/* Background */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {/* Blue Glow */}
                        <div className="
                                absolute -left-32 -top-32
                                h-[520px] w-[520px]
                                rounded-full
                                bg-primary/15
                                blur-[120px]
                            "
                        />

                        {/* Cyan Glow */}
                        <div className="
                                absolute -bottom-40 -right-40
                                h-[520px] w-[520px]
                                rounded-full
                                bg-secondary/15
                                blur-[120px]
                            "
                        />

                        {/* Center Glow */}
                        <div className="
                                absolute left-1/2 top-1/2
                                h-[360px] w-[360px]
                                -translate-x-1/2
                                -translate-y-1/2
                                rounded-full
                                bg-primary/10
                                blur-[100px]
                            "
                        />

                        {/* Subtle Grid */}
                        <div className="
                                absolute inset-0
                                opacity-[0.035]
                                [background-image:linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)]
                                [background-size:48px_48px]
                            "
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -80 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex w-full max-w-xl mx-auto flex-col items-center text-center"
                    >


                        {/* Content */}
                        <div className="relative z-10 flex min-h-screen w-full mx-auto items-center justify-center px-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="flex w-full max-w-xl flex-col items-center text-center mx-auto"
                            >

                                {/* Back Home */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 0.15,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="mb-7"
                                >
                                    <Link
                                        href="/"
                                        className="
                                            group relative inline-flex items-center gap-2
                                            overflow-hidden
                                            rounded-full
                                            border border-white/80
                                            bg-white/70
                                            px-5 py-2.5
                                            text-sm font-medium
                                            text-slate-600
                                            shadow-sm
                                            backdrop-blur-xl
                                            transition-all duration-300
                                            hover:border-primary/30
                                            hover:text-primary
                                            hover:shadow-md
                                        "
                                    >
                                        {/* Blue Water Wave */}
                                        <motion.span
                                            className="
                                                pointer-events-none absolute
                                                -bottom-8 -left-4
                                                h-12 w-[140%]
                                                rounded-[50%]
                                                bg-primary/15
                                                blur-[1px]
                                            "
                                            animate={{
                                                x: ["-8%", "8%", "-8%"],
                                                rotate: [-2, 2, -2],
                                            }}
                                            transition={{
                                                duration: 3.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        />

                                        {/* Second Wave */}
                                        <motion.span
                                            className="
                                                pointer-events-none absolute
                                                -bottom-9 -left-10
                                                h-10 w-[150%]
                                                rounded-[50%]
                                                bg-cyan-400/10
                                            "
                                            animate={{
                                                x: ["8%", "-8%", "8%"],
                                                rotate: [2, -2, 2],
                                            }}
                                            transition={{
                                                duration: 4.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        />

                                        {/* Shine */}
                                        <motion.span
                                            className="
                                                pointer-events-none absolute
                                                inset-0
                                                bg-gradient-to-r
                                                from-transparent
                                                via-white/30
                                                to-transparent
                                            "
                                            animate={{
                                                x: ["-120%", "120%"],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                repeatDelay: 2,
                                                ease: "easeInOut",
                                            }}
                                        />

                                        {/* Text */}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <span className="text-primary/70 transition-colors group-hover:text-primary">
                                                ←
                                            </span>
                                            Back to Home
                                        </span>
                                    </Link>
                                </motion.div>

                                {/* Glass Content */}
                                <div
                                    className="
                                        relative w-full
                                        overflow-hidden
                                        rounded-[2rem]
                                        border border-white/80
                                        bg-white/60
                                        px-8 py-8
                                        shadow-[0_20px_70px_rgba(15,23,42,0.08)]
                                        backdrop-blur-2xl
                                    "
                                >
                                    {/* CARD BACKGROUND EFFECTS */}

                                    {/* Primary Glow */}
                                    <div
                                        className="
                                            pointer-events-none absolute
                                            -right-24 -top-24
                                            h-64 w-64 mx-auto
                                            rounded-full
                                            bg-primary/10
                                            blur-3xl
                                        "
                                    />

                                    {/* Cyan Glow */}
                                    <div
                                        className="
                                        pointer-events-none absolute
                                        -bottom-24 -left-24
                                        h-64 w-64
                                        rounded-full
                                        bg-secondary/10
                                        blur-3xl
                                    "
                                    />

                                    {/* Water Wave 1 */}
                                    <motion.div
                                        className="
                                        pointer-events-none absolute
                                        -bottom-24 -left-[15%]
                                        h-48 w-[130%]
                                        rounded-[50%]
                                        bg-primary/[0.08]
                                        blur-[2px]
                                    "
                                        animate={{
                                            x: ["-5%", "5%", "-5%"],
                                            rotate: [-1.5, 1.5, -1.5],
                                        }}
                                        transition={{
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />

                                    {/* Water Wave 2 */}
                                    <motion.div
                                        className="
                                        pointer-events-none absolute
                                        -bottom-28 -left-[20%]
                                        h-40 w-[140%]
                                        rounded-[50%]
                                        bg-cyan-400/[0.07]
                                    "
                                        animate={{
                                            x: ["6%", "-6%", "6%"],
                                            rotate: [1.5, -1.5, 1.5],
                                        }}
                                        transition={{
                                            duration: 7,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />

                                    {/* Water Wave 3 */}
                                    <motion.div
                                        className="
                                        pointer-events-none absolute
                                        -bottom-32 -left-[10%]
                                        h-32 w-[120%]
                                        rounded-[50%]
                                        bg-blue-300/[0.06]
                                    "
                                        animate={{
                                            x: ["-4%", "4%", "-4%"],
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    />

                                    {/* Soft Moving Shine */}
                                    <motion.div
                                        className="
                                        pointer-events-none absolute
                                        inset-y-0 -left-1/2
                                        w-1/3
                                        rotate-[15deg]
                                        bg-gradient-to-r
                                        from-transparent
                                        via-white/20
                                        to-transparent
                                        blur-xl
                                    "
                                        animate={{
                                            x: ["0%", "400%"],
                                        }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            ease: "easeInOut",
                                        }}
                                    />

                                    <div className="relative z-10 mx-auto">

                                        {/* Small Label */}
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
                                            Welcome to LAUNDRIX
                                        </p>

                                        {/* Heading */}
                                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 xl:text-4xl">
                                            Welcome Back!
                                        </h2>

                                        {/* Description */}
                                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                                            Sign in to manage your laundry orders, track deliveries,
                                            and enjoy a smarter laundry experience.
                                        </p>

                                        {/* Animation */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                duration: 0.7,
                                                delay: 0.15,
                                            }}
                                            className="mx-auto mt-2 flex h-[330px] w-[430px] items-center justify-center"
                                        >
                                            <DotLottieReact
                                                src="/animations/sign-in.lottie"
                                                loop
                                                autoplay
                                            />
                                        </motion.div>

                                        {/* Bottom Status */}
                                        <div className="flex justify-center">
                                            <div
                                                className="
                                                inline-flex items-center gap-2
                                                rounded-full
                                                border border-white/80
                                                bg-white/70
                                                px-4 py-2
                                                text-xs text-slate-500
                                                shadow-sm
                                                backdrop-blur-md
                                            "
                                            >
                                                <motion.span
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                        opacity: [0.7, 1, 0.7],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                                                />

                                                Fast. Secure. Reliable laundry service.
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
                {/* Right Side */}
                <motion.div
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex min-h-screen my-2 items-center justify-center bg-slate-50 px-6"
                >
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="mb-2 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>

                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                Sign In
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Welcome back to LAUNDRIX
                            </p>
                            <p className="mt-2 text-slate-500">
                                No account?
                                <Link href={'/register'}>
                                    <span className="ml-2 cursor-pointer font-medium text-blue-600 hover:underline">
                                        Create one free →
                                    </span>
                                </Link>
                            </p>
                        </div>
                        <SignInForm />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
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