"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ShieldCheck, Sparkles, RotateCcw, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationTable from "./VerificationTable";
import { VerificationType } from "../types";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-blue-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-300" />
              <span className="text-cyan-200 text-xs font-black uppercase tracking-widest">Delivery Agent Security</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">Delivery OTP Verification</h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Verify customer garment handovers safely using 6-digit OTP passcode verification.
            </p>
          </div>
          {!loading && data.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[85px] shadow-inner">
                <p className="text-cyan-200 text-[10px] font-black uppercase tracking-wider">Pending</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{pending}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[85px] shadow-inner">
                <p className="text-cyan-200 text-[10px] font-black uppercase tracking-wider">Verified</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{verified}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",    sub: "All verifications",   value: data.length, iconBg: "bg-blue-50 dark:bg-blue-950/50",  iconColor: "text-blue-600 dark:text-blue-400",  ringColor: "ring-blue-100 dark:ring-blue-900/40"  },
            { label: "Pending",  sub: "Awaiting OTP",        value: pending,     iconBg: "bg-amber-50 dark:bg-amber-950/50",   iconColor: "text-amber-600 dark:text-amber-400",   ringColor: "ring-amber-100 dark:ring-amber-900/40"   },
            { label: "Verified", sub: "Confirmed deliveries", value: verified,   iconBg: "bg-emerald-50 dark:bg-emerald-950/50", iconColor: "text-emerald-600 dark:text-emerald-400", ringColor: "ring-emerald-100 dark:ring-emerald-900/40" },
          ].map(({ label, sub, value, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
                <p className="mt-1 text-xs font-black text-slate-700 dark:text-slate-200 leading-tight">{label}</p>
                <p className="text-[11px] font-medium text-slate-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 px-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-rose-600 gap-1.5">
              <RotateCcw size={13} /> Clear
            </Button>
          )}
          {data.length > 0 && (
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="font-black text-slate-800 dark:text-slate-200">{filteredData.length}</span> of{" "}
              <span className="font-black text-slate-800 dark:text-slate-200">{data.length}</span>
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

    </motion.div>
  );
};

export default Verification;
