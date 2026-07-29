"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ShieldCheck, Sparkles, RotateCcw, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationTable from "./VerificationTable";
import { VerificationType } from "../types";

const Verification = () => {
  const [search, setSearch]   = useState("");
  const [data, setData]       = useState<VerificationType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerification = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("laundrix_token");
      const res = await axios.get("/api/delivery-agent/verifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerification(); }, []);

  const filteredData = useMemo(() =>
    data.filter((item) =>
      item.orderId.toString().includes(search) ||
      item.customerName.toLowerCase().includes(search.toLowerCase())
    ), [data, search]);

  const pending  = data.filter((d) => d.verificationStatus !== "VERIFIED").length;
  const verified = data.filter((d) => d.verificationStatus === "VERIFIED").length;

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-emerald-200" />
              <span className="text-emerald-200 text-[11px] font-semibold uppercase tracking-widest">Delivery Agent Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Delivery Verification</h1>
            <p className="mt-1 text-sm text-emerald-100">Verify pickups and deliveries using customer OTP codes.</p>
          </div>
          {!loading && data.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Pending</p>
                <p className="text-white font-extrabold text-xl leading-tight">{pending}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Verified</p>
                <p className="text-white font-extrabold text-xl leading-tight">{verified}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",    sub: "All verifications",   value: data.length, iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100"  },
            { label: "Pending",  sub: "Awaiting OTP",        value: pending,     iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
            { label: "Verified", sub: "Confirmed deliveries", value: verified,   iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
          ].map(({ label, sub, value, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          {data.length > 0 && (
            <p className="text-[11px] text-slate-400 ml-auto">
              Showing <span className="font-semibold text-slate-600">{filteredData.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{data.length}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <VerificationTable
        data={filteredData}
        search={search}
        setSearch={setSearch}
        fetchVerification={fetchVerification}
        loading={loading}
      />

    </div>
  );
};

export default Verification;
