"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { SignInForm } from "@/components/auth/signin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserKey } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[470px] mx-auto"
      >
        <div className="w-full max-w-[470px] mx-auto">
          <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="space-y-1 pb-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
                <UserKey className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-500 text-base">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm />
            </CardContent>
          </Card>
        </div>
      </motion.div>
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
