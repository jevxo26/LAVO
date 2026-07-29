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
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          {/* Coloured icon */}
          <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${isPickup ? "bg-amber-50" : "bg-indigo-50"}`}>
            {isPickup
              ? <Package size={22} className="text-amber-500" />
              : <ShieldCheck size={22} className="text-indigo-500" />}
          </div>
          <DialogTitle className="text-center text-base font-extrabold text-slate-900">
            {isPickup ? "Verify Pickup OTP" : "Verify Delivery OTP"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            Enter the OTP shared by the customer to confirm this {isPickup ? "pickup" : "delivery"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Order info */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Order ID</span>
              <span className="font-bold text-slate-900 font-mono">#{verification?.orderId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Customer</span>
              <span className="font-semibold text-slate-700">{verification?.customerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Type</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border
                ${isPickup
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                {isPickup ? "Pickup" : "Drop-off"}
              </span>
            </div>
          </div>

          {/* OTP input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound size={12} className="text-slate-400" /> Enter OTP
            </label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. 123456"
              maxLength={8}
              className="rounded-xl h-11 text-center text-lg font-extrabold tracking-[0.3em] text-slate-900 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
              autoComplete="one-time-code"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={handleClose} disabled={loading}
              className="flex-1 rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !otp.trim()}
              className={`flex-1 rounded-xl font-bold gap-1.5
                ${isPickup ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
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
