"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ShieldCheck, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationTable from "./VerificationTable";
import { VerificationType } from "../types";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

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
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Delivery Agent Security"
        title="Delivery OTP Verification"
        description="Verify customer garment handovers safely using 6-digit OTP passcode verification."
        icon={ShieldCheck}
        liveLabel="Live Dispatch"
        chips={!loading && data.length > 0 ? [
          { label: "Pending",  value: pending  },
          { label: "Verified", value: verified },
        ] : []}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OverviewStatCard label="Total"    sub="All verifications"    value={data.length} icon={ShieldCheck} gradient="from-blue-500 to-indigo-600"    />
          <OverviewStatCard label="Pending"  sub="Awaiting OTP"         value={pending}     icon={ShieldCheck} gradient="from-amber-400 to-orange-500"   />
          <OverviewStatCard label="Verified" sub="Confirmed deliveries" value={verified}    icon={ShieldCheck} gradient="from-emerald-500 to-teal-600"   />
        </div>
      )}

      {/* ── 3. Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer…"
              className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5">
              <RotateCcw size={13} /> Clear
            </Button>
          )}
          {data.length > 0 && (
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-black text-card-foreground">{filteredData.length}</span> of{" "}
              <span className="font-black text-card-foreground">{data.length}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── 4. Table ─────────────────────────────────────────────────────────── */}
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
