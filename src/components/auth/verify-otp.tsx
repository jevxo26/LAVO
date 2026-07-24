"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function VerifyOTPForm() {
  const router = useRouter();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(55);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const values = pasted.split("");

    const newOtp = [...otp];

    values.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    inputRefs.current[Math.min(values.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Enter the complete OTP");
      return;
    }

    try {
      setLoading(true);

      // API Call Here
      console.log(code);

      toast.success("OTP verified successfully!");

      router.push("/login");
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setTimer(55);

    toast.success("OTP sent again");
  };

  return (
    <div className="space-y-8">

      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            maxLength={1}
            onPaste={handlePaste}
            onChange={(e) =>
              handleChange(e.target.value, index)
            }
            onKeyDown={(e) =>
              handleKeyDown(e, index)
            }
            className="h-16 w-16 rounded-xl border border-slate-300 text-center text-2xl font-bold outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        ))}
      </div>

      <div className="text-center text-sm text-slate-500">
        {timer > 0 ? (
          <>
            Resend in{" "}
            <span className="font-semibold text-slate-800">
              0:{timer.toString().padStart(2, "0")}
            </span>
          </>
        ) : (
          <button
            onClick={resendOTP}
            className="font-semibold text-blue-600 hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>

      <Button
        onClick={handleVerify}
        disabled={loading}
        className="h-12 w-full rounded-xl"
      >
        {loading ? (
          "Verifying..."
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify Code
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={() => router.push("/register")}
        className="block w-full text-center text-sm text-slate-500 hover:text-blue-600"
      >
        Change phone number or email
      </button>

    </div>
  );
}