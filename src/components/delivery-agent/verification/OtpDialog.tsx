"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VerificationType } from "../types";
import axios from "axios";

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

            await axios.patch(
                `/api/delivery-agent/verify-delivery/${verification.deliveryId}`,
                { otp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await fetchVerification();

            setOtp("");
            onClose();
        } catch (error) {
            console.error(error);
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
                    <DialogTitle>Verify Delivery OTP</DialogTitle>
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