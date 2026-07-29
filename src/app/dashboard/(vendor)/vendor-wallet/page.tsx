"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Wallet, TrendingUp, Clock, Banknote, ArrowUpRight, ArrowDownLeft, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction { id: string; type: string; amount: number; status: string; referenceId: string | null; createdAt: string; }
interface WalletData {
  walletBalance: number; pendingBalance: number; totalEarnings: number;
  totalCommissionDeducted: number; status: string; recentTransactions: Transaction[];
}

function txStatusStyle(s: string): { cls: string; dot: string } {
  if (s === "COMPLETED") return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  if (s === "PENDING")   return { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"   };
  return                        { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"    };
}

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />; }
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid gap-5 sm:grid-cols-2"><Sk className="h-44 rounded-2xl" /><Sk className="h-44 rounded-2xl" /></div>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="space-y-2"><Sk className="h-4 w-40" /><Sk className="h-3 w-56" /></div>
        </div>
        <div className="divide-y divide-slate-50">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Sk className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5"><Sk className="h-3.5 w-28" /><Sk className="h-3 w-20" /></div>
              <Sk className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorWalletPage() {
  const [data, setData]       = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const loadData = async () => {
    setError(false);
    try {
      const res  = await authFetch("/vendor-dashboard/wallet");
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <PageSkeleton />;
  if (error) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50"><AlertCircle size={26} className="text-rose-400" /></div>
      <p className="text-sm font-semibold text-slate-700">Could not load wallet data</p>
      <Button size="sm" variant="outline" onClick={loadData} className="mt-4 rounded-xl text-xs font-bold">Retry</Button>
    </div>
  );
  if (!data) return null;

  const totalIn  = data.recentTransactions.filter((t) => t.type === "CREDIT"  && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);
  const totalOut = data.recentTransactions.filter((t) => t.type === "DEBIT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Wallet size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Wallet</h1>
            <p className="mt-1 text-sm text-indigo-200">View your balance, earnings, and transaction history.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Balance</p>
              <p className="text-white font-extrabold text-xl leading-tight">৳{data.walletBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Balance cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Wallet card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-7 text-white shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-indigo-400" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-indigo-500" />
          </div>
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">Available Balance</p>
                <p className="mt-1.5 text-4xl font-extrabold tracking-tight leading-none">৳{data.walletBalance.toLocaleString()}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Wallet size={22} className="text-indigo-200" /></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-indigo-200">
                <TrendingUp size={11} /> BDT — Bangladesh Taka
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
              </div>
            </div>
          </div>
        </div>

        {/* Earnings summary card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-7 text-white shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">Total Earnings</p>
                <p className="mt-1.5 text-4xl font-extrabold tracking-tight leading-none">৳{data.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><TrendingUp size={22} className="text-emerald-200" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
              {[
                { label: "Pending",    value: `৳${data.pendingBalance.toLocaleString()}` },
                { label: "Commission", value: `৳${data.totalCommissionDeducted.toLocaleString()}` },
                { label: "Credited",   value: `৳${totalIn.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-200">{label}</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Transactions ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50"><Sparkles size={13} className="text-indigo-500" /></div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Recent Transactions</h2>
              <p className="text-[11px] text-slate-400">Your latest wallet activity</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">{data.recentTransactions.length}</span>
        </div>

        {data.recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50"><Wallet size={24} className="text-indigo-400" /></div>
            <p className="text-sm font-semibold text-slate-700">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.recentTransactions.map((tx) => {
              const isCredit = tx.type === "CREDIT" || tx.amount > 0;
              const { cls, dot } = txStatusStyle(tx.status);
              return (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border
                    ${isCredit ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                    {isCredit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">{tx.type}</p>
                    <p className="text-[11px] font-semibold text-slate-400 font-mono">{tx.referenceId || "—"}</p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{tx.status}
                  </span>
                  <p className={`shrink-0 text-sm font-extrabold ${isCredit ? "text-emerald-600" : "text-slate-900"}`}>
                    {isCredit ? "+" : "−"}৳{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
