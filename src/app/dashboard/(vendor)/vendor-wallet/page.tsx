"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingUp, Clock, Banknote } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  referenceId: string | null;
  createdAt: string;
}

interface WalletData {
  walletBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalCommissionDeducted: number;
  status: string;
  recentTransactions: Transaction[];
}

const TX_STATUS: Record<string, string> = {
  COMPLETED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  PENDING:   "border-amber-300 bg-amber-50 text-amber-700",
  FAILED:    "border-red-300 bg-red-50 text-red-700",
};

export default function VendorWalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/vendor-dashboard/wallet")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <div className="p-8 text-sm text-slate-400">No wallet data found.</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet" description="View your wallet balance, earnings, and transaction history." />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Wallet Balance</CardTitle>
            <Wallet className="size-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">৳{data.walletBalance.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Available to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Balance</CardTitle>
            <Clock className="size-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">৳{data.pendingBalance.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting settlement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
            <TrendingUp className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">৳{data.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Commission Deducted</CardTitle>
            <Banknote className="size-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">৳{data.totalCommissionDeducted.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Total commission paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No transactions yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.type}</TableCell>
                    <TableCell className="font-semibold">৳{tx.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-slate-400">{tx.referenceId ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TX_STATUS[tx.status] ?? ""}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
