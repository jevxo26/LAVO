"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { RefreshCw, ArrowDownLeft, ArrowUpRight, Wallet, TrendingDown } from "lucide-react";
import { authFetch } from "@/lib/api";
import { AdminCrudPage } from "@/components/shared/admin-crud";
import { type CrudModuleConfig } from "@/components/shared/admin-crud";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { PageHeader } from "@/components/shared/PageHeader";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletTx {
  id:        string;
  customer:  string;
  email:     string;
  type:      string;
  amount:    string;
  purpose:   string;
  status:    string;
  createdAt: string;
  _raw:      number; // numeric amount for stats
}

// ─── Config ───────────────────────────────────────────────────────────────────

function makeConfig(data: WalletTx[]): CrudModuleConfig<WalletTx> {
  return {
    title:             "Wallet Transactions",
    description:       "Audit customer deposits, order debits, refunds, and promo credits",
    createLabel:       "Add Entry",
    searchPlaceholder: "Search by customer, ref ID or purpose…",
    emptyTitle:        "No transactions found",
    emptyDescription:  "No wallet transactions match the current filters.",
    data,
    columns: [
      { accessorKey: "id",        header: "Ref ID",    kind: "id"       },
      { accessorKey: "customer",  header: "Customer"                    },
      { accessorKey: "type",      header: "Type",      kind: "status"   },
      { accessorKey: "amount",    header: "Amount",    kind: "currency" },
      { accessorKey: "purpose",   header: "Purpose"                     },
      { accessorKey: "status",    header: "Status",    kind: "status"   },
      { accessorKey: "createdAt", header: "Timestamp"                   },
    ],
    schema: z.object({
      customer:  z.string().min(1),
      email:     z.string().email(),
      type:      z.string().min(1),
      amount:    z.string().min(1),
      purpose:   z.string().min(1),
      status:    z.string().min(1),
      createdAt: z.string().min(1),
      _raw:      z.coerce.number(),
    }),
    fields: [
      { name: "customer",  label: "Customer Name",   placeholder: "Full name"            },
      { name: "email",     label: "Email",            placeholder: "customer@example.com" },
      { name: "type",      label: "Type",             options: ["CREDIT","DEBIT","REFUND","PROMO"] },
      { name: "amount",    label: "Amount (৳)",       placeholder: "0.00"                 },
      { name: "purpose",   label: "Purpose",          placeholder: "e.g. Order payment"  },
      { name: "status",    label: "Status",           options: ["COMPLETED","PENDING","FAILED","REVERSED"] },
      { name: "createdAt", label: "Timestamp",        placeholder: "YYYY-MM-DD HH:mm"    },
    ],
    getRowLabel: (row) => `${row.customer} — ${row.amount}`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletTransactionsPage() {
  const [txs, setTxs]         = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxs = () => {
    setLoading(true);
    authFetch("/customer-ops/wallet-transactions")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setTxs(
            res.data.map((tx: any) => {
              const rawAmt = Number(tx.amount) || 0;
              return {
                id:        tx.id,
                customer:  tx.userName  ?? tx.user?.fullName ?? "—",
                email:     tx.userEmail ?? tx.user?.email    ?? "—",
                type:      tx.type      ?? "DEBIT",
                amount:    `৳ ${rawAmt.toFixed(2)}`,
                purpose:   tx.purpose   ?? tx.description    ?? "—",
                status:    tx.status    ?? "COMPLETED",
                createdAt: tx.createdAt
                  ? new Date(tx.createdAt).toLocaleString("en-US", {
                      month: "short", day: "numeric",
                      year: "numeric", hour: "2-digit", minute: "2-digit",
                    })
                  : "—",
                _raw: rawAmt,
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTxs(); }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalCredits = txs
    .filter((t) => ["CREDIT","REFUND","PROMO"].includes(t.type.toUpperCase()))
    .reduce((s, t) => s + t._raw, 0);

  const totalDebits = txs
    .filter((t) => t.type.toUpperCase() === "DEBIT")
    .reduce((s, t) => s + t._raw, 0);

  const netBalance  = totalCredits - totalDebits;
  const fmtAmt = (n: number) =>
    n >= 100000 ? `৳${(n / 100000).toFixed(2)}L` : `৳${n.toFixed(0)}`;

  return (
    <div className="space-y-5">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Customer Operations"
        title="Wallet Transactions Log"
        description="Audit customer deposits, order debits, refunds, and promotional credits across the platform."
        liveLabel="Audit Log"
        chips={[
          { label: "Total Credits",  value: fmtAmt(totalCredits),  sub: `${txs.filter((t) => ["CREDIT","REFUND","PROMO"].includes(t.type.toUpperCase())).length} txns` },
          { label: "Total Debits",   value: fmtAmt(totalDebits),   sub: `${txs.filter((t) => t.type.toUpperCase() === "DEBIT").length} txns` },
          { label: "Net Flow",       value: fmtAmt(Math.abs(netBalance)), sub: netBalance >= 0 ? "Surplus" : "Deficit" },
        ]}
      />

      {/* ── Summary stat cards ─────────────────────────────────────────── */}
      {txs.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <OverviewStatCard
            title="Total Credits"
            value={fmtAmt(totalCredits)}
            sub={`${txs.filter((t) => ["CREDIT","REFUND","PROMO"].includes(t.type.toUpperCase())).length} transactions`}
            icon={ArrowDownLeft}
            gradient="from-emerald-500 to-teal-600"
          />
          <OverviewStatCard
            title="Total Debits"
            value={fmtAmt(totalDebits)}
            sub={`${txs.filter((t) => t.type.toUpperCase() === "DEBIT").length} transactions`}
            icon={TrendingDown}
            gradient="from-rose-500 to-pink-600"
          />
          <OverviewStatCard
            title="Net Balance Flow"
            value={fmtAmt(Math.abs(netBalance))}
            sub={netBalance >= 0 ? "Net credit surplus" : "Net debit surplus"}
            icon={Wallet}
            gradient={netBalance >= 0 ? "from-primary to-indigo-700" : "from-amber-400 to-orange-500"}
            isPositive={netBalance >= 0}
          />
        </motion.div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <AdminCrudPage config={makeConfig(txs)} hideHeader />
    </div>
  );
}
