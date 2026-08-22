"use client";

import React, { useState } from "react";
import { KeyRound, Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SecurityFormProps {
  onChangePassword: (currentPass: string, newPass: string) => Promise<void>;
}

export const SecurityForm: React.FC<SecurityFormProps> = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword)               { toast.error("Please enter your current password"); return; }
    if (newPassword.length < 6)         { toast.error("New password must be at least 6 characters long"); return; }
    if (newPassword !== confirmPassword) { toast.error("New password and confirm password do not match"); return; }

    setIsLoading(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally { setIsLoading(false); }
  };

  // ── Shared input class ────────────────────────────────────────────────────
  const inputCls = "w-full py-2.5 rounded-xl text-sm font-medium bg-muted/50 border border-border text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors";

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-black text-card-foreground flex items-center gap-2">
          <KeyRound size={20} style={{ color: "var(--primary)" }} /> Security & Password
        </h3>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Update your password to keep your account secure.
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2">
            Current Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              className={`${inputCls} pl-10 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-3 text-muted-foreground hover:text-card-foreground transition-colors"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2">
            New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              className={`${inputCls} pl-10 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-3 text-muted-foreground hover:text-card-foreground transition-colors"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-black text-card-foreground uppercase tracking-wider mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
              className={`${inputCls} pl-10 pr-4`}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Update Password
        </button>
      </div>
    </form>
  );
};
