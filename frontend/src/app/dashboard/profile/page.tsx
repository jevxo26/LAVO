"use client";

import React, { useState, useEffect } from "react";
import { User, KeyRound, Bell, Loader2 } from "lucide-react";
import { ProfileAvatar }                 from "@/components/profile/ProfileAvatar";
import { BasicInfoForm, BasicInfoData }  from "@/components/profile/BasicInfoForm";
import { SecurityForm }                  from "@/components/profile/SecurityForm";
import { PersonalPreferences, PreferenceSettings } from "@/components/settings/PersonalPreferences";
import { DashboardPageHero }             from "@/components/shared/DashboardPageHero";
import { authFetch }                     from "@/lib/api";
import { toast } from "sonner";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab,   setActiveTab]   = useState<"info" | "security" | "preferences">("info");
  const [isLoading,   setIsLoading]   = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [profileData,  setProfileData]  = useState<BasicInfoData>({
    fullName: "", email: "", phone: "",
    alternatePhone: "", role: "CUSTOMER",
    nidNumber: "", isNidLocked: false,
  });
  const [avatarUrl,    setAvatarUrl]    = useState("");
  const [prefSettings, setPrefSettings] = useState<Partial<PreferenceSettings>>({});

  // ── Fetch profile ────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res  = await authFetch("/profile");
      const json = await res.json();
      if (json.success && json.data) {
        setProfileData({
          fullName:       json.data.fullName       || "",
          email:          json.data.email          || "",
          phone:          json.data.phone          || "",
          alternatePhone: json.data.alternatePhone || "",
          role:           json.data.role           || "CUSTOMER",
          nidNumber:      json.data.nidNumber      || "",
          isNidLocked:    json.data.isNidLocked    || false,
        });
        setAvatarUrl(json.data.profileImage || "");
      } else {
        toast.error(json.message || "Failed to load profile details");
      }
    } catch { toast.error("Network error while fetching profile"); }
    finally { setIsLoading(false); }
  };

  const fetchPreferences = async () => {
    try {
      const res  = await authFetch("/profile/preferences");
      const json = await res.json();
      if (json.success && json.data) {
        setPrefSettings({
          emailNotification:    json.data.emailNotification    ?? true,
          pushNotification:     json.data.pushNotification     ?? true,
          smsNotification:      json.data.smsNotification      ?? true,
          marketingNotification: json.data.marketingNotification ?? false,
        });
      }
    } catch { /* non-critical — component falls back to defaults */ }
  };

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSaveBasicInfo = async (
    updated: Partial<BasicInfoData>,
    overrideProfileImage?: string,
  ) => {
    const res  = await authFetch("/profile", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updated,
        profileImage: overrideProfileImage ?? avatarUrl,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Update failed");
    await fetchProfile();
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const res  = await authFetch("/profile/password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Password change failed");
  };

  const handleAvatarChange = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    setIsUploading(true);
    try {
      await handleSaveBasicInfo(
        { fullName: profileData.fullName, alternatePhone: profileData.alternatePhone },
        newUrl,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to save avatar");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-muted-foreground font-bold">
        <Loader2 size={22} className="animate-spin" style={{ color: "var(--primary)" }} />
        Loading account profile…
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Account & Profile Settings"
        title="My Profile"
        description="Manage your credentials, personal info, security, and notification preferences."
        icon={User}
        chips={[{ label: "Role", value: profileData.role }]}
      />

      {/* ── Avatar ───────────────────────────────────────────────────────────── */}
      <ProfileAvatar
        fullName={profileData.fullName}
        avatarUrl={avatarUrl}
        isUploading={isUploading}       // Fix #3 — spinner now works
        onAvatarChange={handleAvatarChange}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-border gap-4 sm:gap-6">
        {[
          { id: "info"        as const, label: "Basic Info",          icon: User     },
          { id: "security"    as const, label: "Security & Password", icon: KeyRound },
          { id: "preferences" as const, label: "Preferences",         icon: Bell     },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 pb-3 text-sm font-black border-b-2 transition-all ${
                isActive ? "" : "border-transparent text-muted-foreground hover:text-card-foreground"
              }`}
              style={isActive ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Panels ───────────────────────────────────────────────────────── */}
      <div>
        {activeTab === "info" && (
          <BasicInfoForm initialData={profileData} onSave={handleSaveBasicInfo} />
        )}
        {activeTab === "security" && (
          <SecurityForm onChangePassword={handleChangePassword} />
        )}
        {activeTab === "preferences" && (
          // Fix #3 — pass server-loaded preferences as initialSettings
          <PersonalPreferences initialSettings={prefSettings} />
        )}
      </div>
    </div>
  );
}
