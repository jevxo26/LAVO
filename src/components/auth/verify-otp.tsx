"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RotateCcw, ArrowLeft, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const OTP_DURATION = 60; // seconds — matches backend OTP_TTL_SECONDS

export function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(OTP_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Countdown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ── OTP input handlers ───────────────────────────────────────────────────────
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }
    if (!phone) {
      toast.error("Phone number missing. Please go back and register again.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: code }),
      });
      const result = await res.json();

      if (res.ok && result.success !== false) {
        toast.success("Phone verified! Your account is now active. Please sign in.");
        router.push("/login");
      } else {
        toast.error(result.message || "Invalid or expired verification code.");
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!phone) {
      toast.error("Phone number missing. Please go back and register again.");
      return;
    }

    setResending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = await res.json();

      if (res.ok && result.success !== false) {
        toast.success("A new verification code has been sent!");
        setOtp(Array(6).fill(""));
        setTimer(OTP_DURATION);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.message || "Failed to resend code.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Compute progress percentage for timer
  const progressPercent = ((OTP_DURATION - timer) / OTP_DURATION) * 100;
  const isFilled = otp.join("").length === 6;

  return (
    <div className="space-y-6">
      {/* OTP inputs */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => {
          const hasValue = Boolean(digit);
          return (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={digit}
                maxLength={1}
                inputMode="numeric"
                autoComplete="one-time-code"
                onPaste={handlePaste}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={verifying}
                className={`h-14 w-11 sm:h-16 sm:w-14 rounded-2xl text-center text-2xl font-bold outline-none transition-all duration-200 border-2 ${
                  hasValue
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-md shadow-blue-500/10 scale-105"
                    : "border-slate-200 bg-slate-50/50 text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Progress & Resend Timer */}
      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {!canResend ? "Code expires in" : "Didn't get the code?"}
          </span>
        </div>

        <div>
          {!canResend ? (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${100 - progressPercent}%` }}
                />
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold tabular-nums">
                0:{timer.toString().padStart(2, "0")}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 active:scale-95"
            >
              {resending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resend OTP
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={verifying || !isFilled}
        className={`h-13 w-full rounded-2xl text-base font-semibold transition-all duration-300 shadow-lg ${
          isFilled
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99]"
            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
        }`}
      >
        {verifying ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying Code...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verify & Activate Account
          </span>
        )}
      </Button>

      {/* Trust & Back navigation */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
        <div className="flex items-center gap-1.2 text-emerald-600 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>256-bit Encrypted</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change Number
        </button>
      </div>
    </div>
  );
}