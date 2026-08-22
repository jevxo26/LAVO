"use client";

import { useState } from "react";
import axios from "axios";
import { ShieldCheck, KeyRound, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { VerificationType } from "../types";
import { toast } from "@/lib/toast";

type Props = {
  open: boolean;
  verification: VerificationType | null;
  fetchVerification: () => Promise<void>;
  onClose: () => void;
};

const OtpDialog = ({ open, verification, fetchVerification, onClose }: Props) => {
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);

  const isPickup = verification?.deliveryType === "PICKUP";

  const handleClose = () => { setOtp(""); onClose(); };

  const handleSubmit = async () => {
    if (!verification) return;
    if (!otp.trim()) { toast.error("Please enter the OTP"); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("laundrix_token");
      const res   = await axios.patch(
        `/api/delivery-agent/verify-delivery/${verification.deliveryId}`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data?.data?.message || "Verified successfully!");
      await fetchVerification();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-sm rounded-3xl border border-border bg-card">
        <DialogHeader>
          {/* Icon */}
          <div
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: isPickup
                ? "color-mix(in srgb, var(--warning) 10%, transparent)"
                : "color-mix(in srgb, var(--primary) 10%, transparent)",
              color: isPickup ? "var(--warning)" : "var(--primary)",
            }}
          >
            {isPickup ? <Package size={22} /> : <ShieldCheck size={22} />}
          </div>
          <DialogTitle className="text-center text-base font-black text-card-foreground">
            {isPickup ? "Verify Pickup OTP" : "Verify Delivery OTP"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Enter the OTP shared by the customer to confirm this {isPickup ? "pickup" : "delivery"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Order info */}
          <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Order ID</span>
              <span className="font-black text-card-foreground font-mono">#{verification?.orderId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Customer</span>
              <span className="font-bold text-card-foreground">{verification?.customerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Type</span>
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black"
                style={isPickup ? {
                  background: "color-mix(in srgb, var(--warning) 10%, transparent)",
                  borderColor: "color-mix(in srgb, var(--warning) 25%, transparent)",
                  color: "var(--warning)",
                } : {
                  background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                  borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)",
                  color: "var(--primary)",
                }}
              >
                {isPickup ? <Package size={9} /> : <ShieldCheck size={9} />}
                {isPickup ? "Pickup" : "Drop-off"}
              </span>
            </div>
          </div>

          {/* OTP input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-card-foreground flex items-center gap-1.5">
              <KeyRound size={12} className="text-muted-foreground" /> Enter OTP
            </label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. 123456"
              maxLength={8}
              className="rounded-2xl h-11 text-center text-lg font-black tracking-[0.3em] placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
              autoComplete="one-time-code"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={handleClose} disabled={loading}
              className="flex-1 rounded-xl h-10 font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !otp.trim()}
              className="flex-1 rounded-xl h-10 font-black gap-1.5 text-white"
              style={{
                background: isPickup
                  ? "var(--warning)"
                  : "linear-gradient(135deg, var(--primary), var(--ring))",
              }}
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Verifying…</>
                : <><ShieldCheck size={14} /> Verify OTP</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtpDialog;
