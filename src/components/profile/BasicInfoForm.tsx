"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Shield, CreditCard, Save, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export interface BasicInfoData {
  fullName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  role: string;
  nidNumber: string;
  isNidLocked: boolean;
}

interface BasicInfoFormProps {
  initialData: BasicInfoData;
  onSave: (updated: Partial<BasicInfoData>) => Promise<void>;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ initialData, onSave }) => {
  const [fullName,       setFullName]       = useState(initialData.fullName       || "");
  const [alternatePhone, setAlternatePhone] = useState(initialData.alternatePhone || "");
  const [nidNumber,      setNidNumber]      = useState(initialData.nidNumber      || "");
  const [isLoading,      setIsLoading]      = useState(false);

  useEffect(() => {
    setFullName(initialData.fullName || "");
    setAlternatePhone(initialData.alternatePhone || "");
    setNidNumber(initialData.nidNumber || "");
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Full Name cannot be empty"); return; }
    setIsLoading(true);
    try {
      await onSave({
        fullName,
        alternatePhone,
        nidNumber: initialData.isNidLocked ? initialData.nidNumber : nidNumber,
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally { setIsLoading(false); }
  };

  // ── Shared input classes ──────────────────────────────────────────────────
  const inputCls     = "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium bg-muted/50 border border-border text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors";
  const inputDisabled = "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium bg-muted/40 border border-border/60 text-muted-foreground cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-black text-card-foreground flex items-center gap-2">
          <User size={20} style={{ color: "var(--primary)" }} /> Personal Information
        </h3>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Manage your basic identity details and account contact channels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type="text" value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name" required
              className={inputCls}
            />
          </div>
        </div>

        {/* Email — read only */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <Lock size={10} /> Read Only
            </span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input type="email" value={initialData.email || ""} disabled className={inputDisabled} />
          </div>
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2">
            Alternate Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type="tel" value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={inputCls}
            />
          </div>
        </div>

        {/* Role — read only */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Assigned Role</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <Lock size={10} /> System Assigned
            </span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type="text" value={initialData.role || "CUSTOMER"} disabled
              className={`${inputDisabled} font-black uppercase`}
            />
          </div>
        </div>

        {/* NID / Document Number */}
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>NID / Government Document Number</span>
            {initialData.isNidLocked ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1"
                style={{
                  color: "var(--warning)",
                  background: "color-mix(in srgb, var(--warning) 10%, transparent)",
                  borderColor: "color-mix(in srgb, var(--warning) 25%, transparent)",
                }}>
                <Lock size={10} /> Verified & Locked
              </span>
            ) : (
              <span className="text-[10px] font-black" style={{ color: "var(--primary)" }}>
                One-time Entry Available
              </span>
            )}
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type="text" value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              disabled={initialData.isNidLocked}
              placeholder={initialData.isNidLocked ? "NID Recorded" : "Enter your NID or Passport number"}
              className={initialData.isNidLocked ? inputDisabled : inputCls}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="submit" disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </form>
  );
};
