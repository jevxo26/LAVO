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

// ─── Status helpers ───────────────────────────────────────────────────────────

const DELIVERY_STATUS: Record<string, { cls: string; dot: string }> = {
  PENDING:     { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"    },
  IN_PROGRESS: { cls: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-500"     },
  COMPLETED:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500"  },
  CANCELLED:   { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"     },
};

const OTP_STATUS: Record<string, { cls: string; dot: string; icon: React.ElementType }> = {
  PENDING:  { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400",   icon: Clock        },
  VERIFIED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  FAILED:   { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400",    icon: XCircle      },
};

function StatusPill({ status, map }: {
  status: string;
  map: Record<string, { cls: string; dot: string; icon?: React.ElementType }>;
}) {
  const s = map[status?.toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
      {Icon ? <Icon size={10} strokeWidth={2.5} /> : <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {status}
    </span>
  );
}

// ─── VerificationCard ─────────────────────────────────────────────────────────

function VerificationCard({
  item,
  onVerify,
}: {
  item: VerificationType;
  onVerify: (item: VerificationType) => void;
}) {
  const isPickup    = item.deliveryType === "PICKUP";
  const isVerified  = item.verificationStatus === "VERIFIED";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4
      rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200
      ${isVerified
        ? "border-emerald-100 hover:border-emerald-200"
        : "border-slate-100 hover:border-indigo-100 hover:shadow-md"}`}>

      {/* Left: type icon + info */}
      <div className="flex items-start gap-4 min-w-0">
        {/* Type icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl
          ${isPickup ? "bg-amber-50" : "bg-indigo-50"}`}>
          {isPickup
            ? <Package size={20} className="text-amber-500" />
            : <ShieldCheck size={20} className="text-indigo-500" />}
        </div>

        {/* Details */}
        <div className="space-y-1.5 min-w-0">
          {/* Order + type badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 font-mono">
              #{item.orderId}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold
              ${isPickup
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
              {isPickup ? <Package size={9} /> : <ShieldCheck size={9} />}
              {item.deliveryType}
            </span>
            <StatusPill status={item.deliveryStatus}     map={DELIVERY_STATUS} />
            <StatusPill status={item.verificationStatus} map={OTP_STATUS}      />
          </div>

          {/* Meta: customer + phone */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-semibold text-slate-700">{item.customerName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />
              {item.customerPhone}
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

      {/* Right: action */}
      <div className="shrink-0 self-start sm:self-center">
        {isVerified ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200
            bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            OTP Verified
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => onVerify(item)}
            className={`h-9 rounded-xl text-xs font-bold gap-1.5 shadow-sm px-4
              ${isPickup
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"}`}>
            <ShieldCheck size={13} />
            Verify OTP
          </Button>
        )}
      </div>
    </div>
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
  const [open, setOpen]       = useState(false);
  const [selected, setSelected] = useState<VerificationType | null>(null);

  const handleVerify = (item: VerificationType) => { setSelected(item); setOpen(true); };

  return (
    <>
      {/* Card list */}
      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <Loading />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">
            <Inbox size={38} className="text-emerald-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No verifications found</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Verification requests will appear here once pickups or deliveries are assigned to you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <VerificationCard
              key={item.deliveryId}
              item={item}
              onVerify={handleVerify}
            />
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
