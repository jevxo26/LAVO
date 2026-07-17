"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  Loader2,
  XCircle,
  Banknote,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SimulatedPaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const sessionId = params.get("session_id") || "";
  const amount = params.get("amount") || "0";
  const type = params.get("type") || "order"; // "order" | "wallet"
  const ref = params.get("ref") || "";

  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "fail" | "cancel">("idle");

  const postToCallback = async (endpoint: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/payments/sslcommerz/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tran_id: sessionId,
          val_id: "", // empty — verifySSLCommerz treats empty val_id as simulated
          amount,
        }),
        redirect: "follow",
      });

      // The server handler responds with a redirect (302).
      // fetch with redirect:"follow" follows it, but since this is a
      // server-side redirect to a page route, we need to navigate manually.
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      // Fallback: if the response wasn't a redirect, navigate manually
      if (endpoint === "success") {
        setStatus("success");
        const dest =
          type === "wallet"
            ? "/dashboard/wallet?status=success"
            : "/dashboard/my-orders?status=success";
        setTimeout(() => (window.location.href = dest), 1200);
      } else if (endpoint === "cancel") {
        setStatus("cancel");
        const dest =
          type === "wallet"
            ? "/dashboard/wallet?status=cancel"
            : "/dashboard/my-orders?status=cancel";
        setTimeout(() => (window.location.href = dest), 1200);
      } else {
        setStatus("fail");
        const dest =
          type === "wallet"
            ? "/dashboard/wallet?status=fail"
            : "/dashboard/my-orders?status=fail";
        setTimeout(() => (window.location.href = dest), 1200);
      }
    } catch {
      setStatus("fail");
      setProcessing(false);
    }
  };

  const typeLabel = type === "wallet" ? "Wallet Top-up" : "Order Payment";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob" />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl">
          {/* Header banner */}
          <div className="h-2 rounded-t-xl bg-gradient-to-r from-indigo-600 to-cyan-500" />

          <CardHeader className="text-center pb-2 pt-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Simulated Payment Gateway
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Development Mode — No real charges
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {/* Transaction details */}
            <div className="bg-slate-50/80 rounded-xl p-4 space-y-3 border border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" />
                  Type
                </span>
                <span className="font-medium text-slate-700">{typeLabel}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Transaction ID
                </span>
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {sessionId.length > 24
                    ? sessionId.substring(0, 24) + "…"
                    : sessionId}
                </span>
              </div>

              <hr className="border-slate-200" />

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  ৳{parseFloat(amount).toLocaleString("en-BD")}
                </span>
              </div>
            </div>

            {/* Status messages */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-3 text-sm font-medium"
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                Payment successful! Redirecting…
              </motion.div>
            )}

            {status === "cancel" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-3 text-sm font-medium"
              >
                <XCircle className="w-5 h-5 shrink-0" />
                Payment cancelled. Redirecting…
              </motion.div>
            )}

            {status === "fail" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm font-medium"
              >
                <XCircle className="w-5 h-5 shrink-0" />
                Payment failed. Redirecting…
              </motion.div>
            )}

            {/* Action buttons */}
            {status === "idle" && (
              <div className="flex gap-3">
                <Button
                  id="simulated-pay-btn"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg shadow-indigo-200/50 transition-all duration-200"
                  size="lg"
                  disabled={processing}
                  onClick={() => postToCallback("success")}
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  {processing ? "Processing…" : "Pay Now"}
                </Button>

                <Button
                  id="simulated-cancel-btn"
                  variant="outline"
                  size="lg"
                  disabled={processing}
                  onClick={() => postToCallback("cancel")}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2">
              <Lock className="w-3 h-3" />
              Simulated gateway for local development only
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SimulatedPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <SimulatedPaymentContent />
    </Suspense>
  );
}
