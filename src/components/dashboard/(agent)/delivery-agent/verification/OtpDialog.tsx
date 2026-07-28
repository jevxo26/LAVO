"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VerificationType } from "../types";
import axios from "axios";
import { toast } from "@/lib/toast";

type Props = {
    open: boolean;
    verification: VerificationType | null;
    fetchVerification: () => Promise<void>;
    onClose: () => void;
}

const OtpDialog = ({
    open,
    verification,
    fetchVerification,
    onClose
}: Props) => {

    const [otp, setOtp] = useState("");

    const handleSubmit = async () => {
        if (!verification) return;
        if (!otp.trim()) {
            alert("Please enter OTP");
            return;
        }

        try {
            const token = localStorage.getItem("laundrix_token");

            const res = await axios.patch(
                `/api/delivery-agent/verify-delivery/${verification.deliveryId}`,
                { otp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Use the message returned by the server (different for PICKUP vs DROP_OFF)
            toast.success(res.data?.data?.message || "Verified successfully!");

            await fetchVerification();

            setOtp("");
            onClose();
        } catch (error:any) {
            // console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Invalid OTP. Please try again."
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    setOtp("");
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {verification?.deliveryType === 'PICKUP'
                            ? '🛍️ Verify Pickup OTP'
                            : '📦 Verify Delivery OTP'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500">
                            Order ID
                        </p>

                        <p className="font-medium">
                            #{verification?.orderId}
                        </p>
                    </div>
                    <input
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOtp("");
                                onClose();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                        >
                            Verify
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
export default OtpDialog;