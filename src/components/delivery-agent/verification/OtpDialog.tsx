"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Verification } from "../../../../types/deliveryAgent/verification";

type Props = {
    open: boolean;
    verification: Verification | null;
    onClose: () => void;
}

const OtpDialog = ({
    open,
    verification,
    onClose
}: Props) => {
    const [otp, setOtp] = useState("");
    
    const handleSubmit = () => {
        console.log({
            orderId: verification?.orderId,
            otp
        });
        // Backend API call ekhane hobe
        onClose();
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => !v && onClose()}
            title="Verify Delivery OTP"
        >
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
                        onClick={onClose}
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
        </Dialog>
    )
}
export default OtpDialog;