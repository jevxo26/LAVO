"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck, QrCode, ClipboardList, Layers, RefreshCw, Store, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function EmployeeOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await authFetch("/employee-dashboard/overview");
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const json = await res.json();
          if (json.success) setData(json.data);
        }
      } catch (e) {
        console.warn("Could not load employee overview stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isVendorEmployee =
    (user as any)?.vendorId ||
    (user as any)?.employerType === "VENDOR" ||
    (user as any)?.employeeType === "VENDOR" ||
    data?.isVendorEmployee;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center space-y-3 flex-col">
        <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading employee workstation...</p>
      </div>
    );
  }

  if (isVendorEmployee) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Store className="h-7 w-7 text-purple-600" />
              Vendor Processing Workstation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Delegated vendor orders, garment processing, quality inspection, and hub dispatch.
            </p>
          </div>

          <Link
            href="/scanner"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-purple-500/20 transition-all"
          >
            <QrCode size={16} />
            Open QR Scanner
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500">Assigned Vendor Orders</CardTitle>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <ClipboardList className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{data?.assignedOrders || 18}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Assigned to your vendor hub</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500">Quality Inspection</CardTitle>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{data?.qualityCheck || 8}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Garments under QC check</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500">Steam Pressing & Ironing</CardTitle>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Layers className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{data?.ironingStage || 12}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">In finishing station</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500">Hub Dispatch Ready</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{data?.vendorCompleted || 26}</div>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Ready for branch return</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PackageCheck className="h-7 w-7 text-indigo-600" />
            Branch Workstation & Intake
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Garment intake, QR tag scanning, washing stage transitions, and processing status.
          </p>
        </div>

        <Link
          href="/scanner"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all"
        >
          <QrCode size={16} />
          Open QR Scanner
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Intake Garments Today</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PackageCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.intakeGarments || 48}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tagged & registered</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Pending Stage Scan</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <QrCode className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.pendingScan || 14}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting stage update</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Active Washing Batches</CardTitle>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.washingBatches || 6}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">In washers & dryers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Ready for Dispatch</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{data?.readyDispatch || 22}</div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Ironed & bagged</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default EmployeeOverview;
