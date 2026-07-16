"use client";

import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";

interface Props {
  onLogin: (token: string, user: any) => void;
}

export function ScannerLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-indigo-300 text-sm font-medium tracking-widest uppercase">
          <ScanLine size={16} /> LAVO Employee Scanner
        </div>
        <h1 className="text-3xl font-bold text-white">Sign In to Scan</h1>
        <p className="text-slate-400 mt-1 text-sm">Use your employee credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-colors"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-colors"
        />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors px-6 py-3 text-white font-semibold text-sm"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In & Scan"}
        </button>
      </form>
    </div>
  );
}
