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

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  initialData,
  onSave,
}) => {
  const [fullName, setFullName] = useState(initialData.fullName || "");
  const [alternatePhone, setAlternatePhone] = useState(initialData.alternatePhone || "");
  const [nidNumber, setNidNumber] = useState(initialData.nidNumber || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFullName(initialData.fullName || "");
    setAlternatePhone(initialData.alternatePhone || "");
    setNidNumber(initialData.nidNumber || "");
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        fullName,
        alternatePhone,
        nidNumber: initialData.isNidLocked ? initialData.nidNumber : nidNumber,
      });
      toast.success("Profile basic information updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="text-blue-600" size={20} /> Personal Information
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your basic identity details and account contact channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Email - READ ONLY */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock size={10} /> Read Only</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="email"
              value={initialData.email || ""}
              disabled
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed"
            />
          </div>
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Alternate Phone</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="tel"
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Role - READ ONLY */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Assigned Role</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock size={10} /> System Assigned</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={initialData.role || "CUSTOMER"}
              disabled
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm uppercase cursor-not-allowed"
            />
          </div>
        </div>

        {/* NID / Document Number */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>NID / Government Document Number</span>
            {initialData.isNidLocked ? (
              <span className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 flex items-center gap-1 font-semibold">
                <Lock size={10} /> Verified & Locked
              </span>
            ) : (
              <span className="text-[10px] text-blue-600 font-semibold">One-time Entry Available</span>
            )}
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              disabled={initialData.isNidLocked}
              placeholder={initialData.isNidLocked ? "NID Recorded" : "Enter your NID or Passport number"}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium ${
                initialData.isNidLocked
                  ? "bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
};
