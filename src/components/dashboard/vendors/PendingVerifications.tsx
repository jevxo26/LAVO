"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ShieldAlert, CheckSquare } from "lucide-react";
import { VerificationDrawer } from "./VerificationDrawer";

export function PendingVerifications() {
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get("/api/admin/vendors/pending");
      setPendingVendors(res.data.data || []);
    } catch {
      toast.error("Failed to load pending verifications list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  if (loading) return <div className="text-slate-400 text-sm font-semibold p-6 text-center">Loading pending verifications...</div>;

  if (pendingVendors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
        <CheckSquare size={48} className="text-slate-200" />
        <span className="text-slate-400 font-bold text-sm">All vendors are fully verified. No pending approvals!</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pendingVendors.map((vendor) => (
        <div key={vendor.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg w-max text-xs font-bold uppercase tracking-wide">
              <ShieldAlert size={14} /> Pending Audit
            </div>
            <h4 className="font-bold text-slate-800 text-base leading-snug">{vendor.businessName}</h4>
            <p className="text-slate-400 text-xs font-medium">Owner: {vendor.ownerName}</p>
            <p className="text-slate-400 text-xs font-medium">Contact: {vendor.phone}</p>
          </div>
          <button
            onClick={() => setSelectedVendor(vendor)}
            className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            Review & Verify
          </button>
        </div>
      ))}

      {selectedVendor && (
        <VerificationDrawer
          vendor={selectedVendor}
          isOpen={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onProcessed={fetchPending}
        />
      )}
    </div>
  );
}
