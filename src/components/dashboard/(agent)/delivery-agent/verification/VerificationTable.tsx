"use client";

import { useState } from "react";
import {
  ShieldCheck, Package, MapPin, Phone,
  User, CheckCircle2, Clock, XCircle, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import OtpDialog from "./OtpDialog";
import { VerificationType } from "../types";
import Loading from "../Loading";
import { motion } from "framer-motion";

// ─── Status helpers ───────────────────────────────────────────────────────────

const DELIVERY_STATUS: Record<string, { cls: string; dot: string }> = {
  PENDING:     { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse" },
  IN_PROGRESS: { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary animate-pulse" },
  COMPLETED:   { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success"               },
  CANCELLED:   { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error"                 },
};

const OTP_STATUS: Record<string, { cls: string; dot: string; icon: React.ElementType }> = {
  PENDING:  { cls: "bg-warning/10 text-warning border-warning/25", dot: "bg-warning",  icon: Clock        },
  VERIFIED: { cls: "bg-success/10 text-success border-success/25", dot: "bg-success",  icon: CheckCircle2 },
  FAILED:   { cls: "bg-error/10 text-error border-error/25",       dot: "bg-error",    icon: XCircle      },
};

function StatusPill({ status, map }: {
  status: string;
  map: Record<string, { cls: string; dot: string; icon?: React.ElementType }>;
}) {
  const s    = map[status?.toUpperCase()] ?? { cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50" };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      {Icon
        ? <Icon size={10} strokeWidth={2.5} />
        : <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {status}
    </span>
  );
}

// ─── VerificationCard ─────────────────────────────────────────────────────────

function VerificationCard({ item, onVerify }: {
  item: VerificationType;
  onVerify: (item: VerificationType) => void;
}) {
  const isPickup   = item.deliveryType === "PICKUP";
  const isVerified = item.verificationStatus === "VERIFIED";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-card p-5 shadow-sm transition-all duration-200 ${
        isVerified
          ? "border-success/25 hover:border-success/40"
          : "border-border hover:border-ring/40 hover:shadow-md"
      }`}
    >
      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Type icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          isPickup ? "bg-warning/10" : "bg-primary/10"
        }`} style={{ color: isPickup ? "var(--warning)" : "var(--primary)" }}>
          {isPickup ? <Package size={20} /> : <ShieldCheck size={20} />}
        </div>

        {/* Details */}
        <div className="space-y-1.5 min-w-0">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-black text-card-foreground font-mono">
              #{item.orderId}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${
              isPickup
                ? "bg-warning/10 text-warning border-warning/25"
                : "bg-primary/10 border-primary/20"
            }`} style={!isPickup ? { color: "var(--primary)" } : undefined}>
              {isPickup ? <Package size={9} /> : <ShieldCheck size={9} />}
              {item.deliveryType}
            </span>
            <StatusPill status={item.deliveryStatus}     map={DELIVERY_STATUS} />
            <StatusPill status={item.verificationStatus} map={OTP_STATUS}      />
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-black text-card-foreground">{item.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />{item.customerPhone}
            </span>
            {item.deliveryAddress && (
              <span className="flex items-center gap-1 max-w-[240px] truncate">
                <MapPin size={11} className="shrink-0" />
                {item.deliveryAddress}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="shrink-0 self-start sm:self-center">
        {isVerified ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-[11px] font-black text-success">
            <CheckCircle2 size={13} /> OTP Verified
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => onVerify(item)}
            className="h-9 rounded-xl text-xs font-black gap-1.5 shadow-sm px-4 text-white"
            style={{ background: isPickup ? "var(--warning)" : "linear-gradient(135deg, var(--primary), var(--ring))" }}
          >
            <ShieldCheck size={13} /> Verify OTP
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── VerificationTable ────────────────────────────────────────────────────────

type Props = {
  data: VerificationType[];
  search: string;
  setSearch: (v: string) => void;
  fetchVerification: () => Promise<void>;
  loading: boolean;
};

const VerificationTable = ({ data, fetchVerification, loading }: Props) => {
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState<VerificationType | null>(null);

  const handleVerify = (item: VerificationType) => { setSelected(item); setOpen(true); };

  return (
    <>
      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <Loading />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-success/10 text-success">
            <Inbox size={38} />
          </div>
          <p className="text-base font-black text-card-foreground">No verifications found</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
            Verification requests will appear here once pickups or deliveries are assigned to you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <VerificationCard key={item.deliveryId} item={item} onVerify={handleVerify} />
          ))}
        </div>
      )}

      <OtpDialog
        open={open}
        verification={selected}
        fetchVerification={fetchVerification}
        onClose={() => { setOpen(false); setSelected(null); }}
      />
    </>
  );
};

export default VerificationTable;
