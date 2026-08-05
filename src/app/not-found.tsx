"use client";

import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
            {/* Background Blur */}
            <div className="absolute inset-0">
                <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .45 }}
                className="relative z-10 w-full max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-xl"
            >
                {/* Icon */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <SearchX className="h-10 w-10" />
                </div>
                {/* 404 */}
                <h1 className="mt-8 text-7xl font-black tracking-tight text-foreground">
                    404
                </h1>
                <h2 className="mt-3 text-3xl font-bold text-foreground">
                    Page Not Found
                </h2>
                <p className="mx-auto mt-5 max-w-md leading-7 text-muted-foreground">
                    The page you're looking for doesn't exist, may have been moved,
                    or the URL might be incorrect.
                </p>
                {/* Buttons */}
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                        <Home className="h-4 w-4" />
                        Back Home
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </div>
                {/* Footer */}
                <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
                    Lost? Return to the homepage and continue exploring LAUNDRIX.
                </div>
            </motion.div>
        </main>
    );
}