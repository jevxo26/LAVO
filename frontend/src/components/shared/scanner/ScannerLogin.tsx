"use client";

import { useState } from "react";
import { ScanLine, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  onLogin: (token: string, user: any) => void;
}

// ─── Scanner login shell (intentionally dark — same as ScannerPage) ───────────

const SHELL_BG: React.CSSProperties = {
  background: [
    "radial-gradient(ellipse 80% 80% at 90% 10%, color-mix(in srgb, var(--primary) 35%, transparent) 0%, transparent 55%)",
    "radial-gradient(ellipse 60% 60% at 10% 90%, color-mix(in srgb, var(--secondary) 25%, transparent) 0%, transparent 50%)",
    "linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, #0f172a) 0%, #0f172a 50%, color-mix(in srgb, var(--secondary) 8%, #0f172a) 100%)",
  ].join(", "),
};

export function ScannerLogin({ onLogin }: Props) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Login failed");
      localStorage.setItem("laundrix_token", json.data.token);
      localStorage.setItem("laundrix_user", JSON.stringify(json.data.user));
      onLogin(json.data.token, json.data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-6 gap-8"
      style={SHELL_BG}
    >
      {/* Back */}
      <Link
        href="/dashboard"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold transition-colors text-white/50 hover:text-white"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 mb-2 text-sm font-black tracking-widest uppercase"
          style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}
        >
          <ScanLine size={16} /> LAVO Employee Scanner
        </div>
        <h1 className="text-3xl font-black text-white">Sign In to Scan</h1>
        <p className="text-white/40 mt-1 text-sm">Use your employee credentials</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border bg-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm outline-none transition-colors"
          style={{ borderColor: "color-mix(in srgb, white 20%, transparent)" }}
          onFocus={(e) => (e.target.style.borderColor = "color-mix(in srgb, var(--primary) 60%, white)")}
          onBlur={(e) => (e.target.style.borderColor = "color-mix(in srgb, white 20%, transparent)")}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border bg-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm outline-none transition-colors"
          style={{ borderColor: "color-mix(in srgb, white 20%, transparent)" }}
          onFocus={(e) => (e.target.style.borderColor = "color-mix(in srgb, var(--primary) 60%, white)")}
          onBlur={(e) => (e.target.style.borderColor = "color-mix(in srgb, white 20%, transparent)")}
        />

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"
            style={{
              background: "color-mix(in srgb, var(--error) 15%, transparent)",
              border: "1px solid color-mix(in srgb, var(--error) 30%, transparent)",
              color: "color-mix(in srgb, var(--error) 70%, white)",
            }}
          >
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In & Scan"}
        </button>
      </form>
    </div>
  );
}
