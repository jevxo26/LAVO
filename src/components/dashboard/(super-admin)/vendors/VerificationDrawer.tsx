"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { CheckCircle, XCircle, FileText } from "lucide-react";

interface VerificationDrawerProps {
  vendor: any;
  isOpen: boolean;
  onClose: () => void;
  onProcessed: () => void;
}

export function VerificationDrawer({ vendor, isOpen, onClose, onProcessed }: VerificationDrawerProps) {
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleVerify = async (isApproved: boolean) => {
    setProcessing(true);
    try {
      await axios.put(`/api/admin/vendors/${vendor.id}/verify`, { isApproved, remarks });
      toast.success(`Vendor ${isApproved ? "Approved" : "Rejected"} successfully`);
      onProcessed();
      onClose();
    } catch {
      toast.error("Failed to process vendor verification");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Verify Vendor Credentials</DialogTitle>
        </DialogHeader>
        {vendor && (
          <div className="space-y-4 mt-2">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div><span className="text-xs font-bold text-slate-400 block uppercase">BUSINESS NAME</span><span className="font-bold text-slate-800 text-sm">{vendor.businessName}</span></div>
              <div><span className="text-xs font-bold text-slate-400 block uppercase">OWNER / EMAIL</span><span className="font-semibold text-slate-600 text-sm">{vendor.ownerName} ({vendor.email})</span></div>
              <div><span className="text-xs font-bold text-slate-400 block uppercase">PHONE</span><span className="text-slate-600 text-sm font-semibold">{vendor.phone}</span></div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Onboarding Documents</span>
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <FileText className="text-blue-500" size={24} />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-700 text-sm block truncate">Trade License Credentials</span>
                  <span className="text-slate-400 text-xs font-semibold">{vendor.tradeLicenseNo || "TL-847294"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Verification Audit Notes</label>
              <textarea
                placeholder="Include verification remarks or reason for rejection..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleVerify(false)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => handleVerify(true)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                <CheckCircle size={16} /> Verify & Approve
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
