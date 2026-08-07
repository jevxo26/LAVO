"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

const OTP_DURATION = 60; // seconds — must match backend OTP_TTL_SECONDS

export function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [otp, setOtp] = useState(Array(6).fill(""));
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    const newOtp = [...otp];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
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
        toast.error(result.message || "Verification failed. Please try again.");
        // Clear the OTP boxes so the user can try again
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("An error occurred. Please try again.");
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
        toast.success("A new verification code has been sent to your phone!");
        setOtp(Array(6).fill(""));
        setTimer(OTP_DURATION);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.message || "Failed to resend code. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const timerLabel = `0:${timer.toString().padStart(2, "0")}`;

  return (
    <div className="space-y-8">
      {/* OTP input boxes */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            value={digit}
            maxLength={1}
            inputMode="numeric"
            autoComplete="one-time-code"
            onPaste={handlePaste}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="h-16 w-16 rounded-xl border-2 border-slate-200 text-center text-2xl font-bold outline-none transition-all
              focus:border-blue-600 focus:ring-2 focus:ring-blue-200
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={verifying}
          />
        ))}
      </div>

      {/* Timer / Resend */}
      <div className="text-center text-sm text-slate-500">
        {!canResend ? (
          <p>
            Resend code in{" "}
            <span className="font-semibold tabular-nums text-slate-800">{timerLabel}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>

      {/* Verify button */}
      <Button
        onClick={handleVerify}
        disabled={verifying || otp.join("").length < 6}
        className="h-12 w-full rounded-xl"
      >
        {verifying ? (
          "Verifying..."
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify & Activate Account
          </>
        )}
      </Button>

      {/* Go back */}
      <button
        type="button"
        onClick={() => router.push("/register")}
        className="block w-full text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        ← Wrong number? Go back to register
      </button>
    </div>
  );
}