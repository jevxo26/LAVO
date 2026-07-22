"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import SummaryCards from "@/components/vendor-dashboard/overview/SummaryCards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface OverviewData {
  vendorId: string;
  businessName: string;
  ownerName: string;
  vendorCode: string;
  status: string;
  isVerified: boolean;
  assignedBranch: { id: string; name: string } | null;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  todayOrders: number;
  walletBalance: number;
  totalEarnings: number;
  pendingSettlement: number;
  completionRate: number;
  acceptanceRate: number;
  averageRating: number;
  totalReviews: number;
}

export default function VendorDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/vendor-dashboard/overview")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message ?? "Failed to load overview");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-10 text-center">
        <p className="text-sm text-slate-500">{error ?? "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Dashboard"
        description={`Welcome back, ${data.ownerName} — ${data.businessName}`}
      />

      {/* Verification & Branch Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Building2 className="size-5 text-indigo-500" />
            <CardTitle className="text-sm font-medium">Assigned Branch</CardTitle>
          </CardHeader>
          <CardContent>
            {data.assignedBranch ? (
              <p className="text-base font-semibold text-slate-800">
                {data.assignedBranch.name}
              </p>
            ) : (
              <p className="text-sm text-slate-400">No branch assigned yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            {data.isVerified ? (
              <ShieldCheck className="size-5 text-emerald-500" />
            ) : (
              <ShieldAlert className="size-5 text-amber-500" />
            )}
            <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                data.isVerified
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-amber-300 bg-amber-50 text-amber-700"
              }
            >
              {data.isVerified ? "Verified" : "Pending Verification"}
            </Badge>
            <span className="text-xs text-slate-400">Code: {data.vendorCode}</span>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <SummaryCards vendor={data} />

      {/* Performance Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {data.completionRate.toFixed(1)}%
            </span>
            <CheckCircle className="mb-1 size-4 text-emerald-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-slate-900">
              {data.acceptanceRate.toFixed(1)}%
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {data.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">
              / 5 ({data.totalReviews} reviews)
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
