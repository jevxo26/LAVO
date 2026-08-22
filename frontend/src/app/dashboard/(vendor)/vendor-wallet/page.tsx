"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Wallet, TrendingUp, Clock, Banknote, ArrowUpRight, ArrowDownLeft, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string; type: string; amount: number;
  status: string; referenceId: string | null; createdAt: string;
}
interface WalletData {
  walletBalance: number; pendingBalance: number; totalEarnings: number;
  totalCommissionDeducted: number; status: string; recentTransactions: Transaction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function txStatusStyle(s: string): { cls: string; dot: string } {
  if (s === "COMPLETED") return { cls: "bg-success/10 text-success border-success/25", dot: "bg-success"   };
  if (s === "PENDING")   return { cls: "bg-warning/10 text-warning border-warning/25", dot: "bg-warning"   };
  return                        { cls: "bg-error/10 text-error border-error/25",       dot: "bg-error"     };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-52 rounded-3xl bg-muted" />
        <div className="h-52 rounded-3xl bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-56 rounded bg-muted" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-9 w-9 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="h-4 w-20 rounded bg-muted ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <AlertCircle size={26} />
      </div>
      <p className="text-sm font-black text-card-foreground">Could not load wallet data</p>
      <Button size="sm" variant="outline" onClick={loadData} className="mt-4 rounded-xl text-xs font-bold border-border">
        Retry
      </Button>
    </div>
  );

  if (!data) return null;

  const totalIn  = data.recentTransactions
    .filter((t) => t.type === "CREDIT" && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = data.recentTransactions
    .filter((t) => t.type === "DEBIT" && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Dashboard"
        title="Vendor Wallet"
        description="View your balance, earnings, pending settlements, and transaction history."
        icon={Wallet}
        chips={[
          { label: "Balance",   value: `৳${data.walletBalance.toLocaleString()}`  },
          { label: "Pending",   value: `৳${data.pendingBalance.toLocaleString()}` },
          { label: "Earnings",  value: `৳${data.totalEarnings.toLocaleString()}`  },
        ]}
      />

      {/* ── 2. Balance + Earnings Cards ──────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">

        {/* Available Balance */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl"
          style={{
            background: [
              "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
              "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
            ].join(", "),
            border: "1px solid color-mix(in srgb, white 18%, transparent)",
            boxShadow: "0 20px 48px -12px color-mix(in srgb, var(--primary) 45%, transparent)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full blur-3xl opacity-[0.40]"
              style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full blur-3xl opacity-[0.30]"
              style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
          </div>
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }}>
                  Available Balance
                </p>
                <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
                  ৳{data.walletBalance.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Wallet size={24} className="text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white/70 backdrop-blur-md">
                <TrendingUp size={11} /> BDT — Bangladesh Taka
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold"
                style={{
                  background: "color-mix(in srgb, var(--success) 20%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                  color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
                Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl"
          style={{
            background: [
              "radial-gradient(ellipse 80% 80% at 90% 20%, color-mix(in srgb, var(--success) 55%, transparent) 0%, transparent 60%)",
              "linear-gradient(135deg, color-mix(in srgb, var(--success) 80%, black 20%) 0%, color-mix(in srgb, var(--success) 55%, var(--primary) 45%) 100%)",
            ].join(", "),
            border: "1px solid color-mix(in srgb, white 18%, transparent)",
            boxShadow: "0 20px 48px -12px color-mix(in srgb, var(--success) 40%, transparent)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full blur-3xl opacity-[0.35]"
              style={{ background: "color-mix(in srgb, var(--success) 55%, white 45%)" }} />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full blur-3xl opacity-[0.25]"
              style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/70">Total Earnings</p>
                <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
                  ৳{data.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <TrendingUp size={24} className="text-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
              {[
                { label: "Pending",    value: `৳${data.pendingBalance.toLocaleString()}`          },
                { label: "Commission", value: `৳${data.totalCommissionDeducted.toLocaleString()}` },
                { label: "Credited",   value: `৳${totalIn.toLocaleString()}`                       },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/60">{label}</p>
                  <p className="text-sm font-black text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 3. Summary Stat Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewStatCard label="Total Credited"    sub="Completed credits"      value={`৳${totalIn.toLocaleString()}`}                             icon={ArrowDownLeft}  gradient="from-emerald-500 to-teal-600"  />
        <OverviewStatCard label="Total Debited"     sub="Deducted/withdrawn"     value={`৳${totalOut.toLocaleString()}`}                            icon={ArrowUpRight}   gradient="from-rose-500 to-pink-600"     />
        <OverviewStatCard label="Commission Paid"   sub="Platform deduction"     value={`৳${data.totalCommissionDeducted.toLocaleString()}`}        icon={Banknote}       gradient="from-amber-400 to-orange-500"  />
      </div>

      {/* ── 4. Transaction History ───────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
              style={{ color: "var(--primary)" }}>
              <History size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-card-foreground">Recent Transactions</h2>
              <p className="text-[11px] text-muted-foreground font-medium">Your latest wallet activity</p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
            {data.recentTransactions.length} Records
          </span>
        </div>

        {data.recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <History size={24} />
            </div>
            <p className="text-sm font-black text-card-foreground">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">Your wallet activity will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.recentTransactions.map((tx) => {
              const isCredit     = tx.type === "CREDIT" || tx.amount > 0;
              const { cls, dot } = txStatusStyle(tx.status);
              return (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    isCredit
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-error/10 text-error border-error/20"
                  }`}>
                    {isCredit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-card-foreground leading-tight">{tx.type}</p>
                    <p className="text-[11px] font-bold text-muted-foreground font-mono">{tx.referenceId || "—"}</p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    {tx.status}
                  </span>
                  <p className={`shrink-0 text-base font-black ${isCredit ? "text-success" : "text-card-foreground"}`}>
                    {isCredit ? "+" : "−"}৳{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
