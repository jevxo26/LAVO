"use client";

import React, { useState, useEffect } from "react";
import { User, KeyRound, Bell, Loader2 } from "lucide-react";
import { ProfileAvatar }                 from "@/components/profile/ProfileAvatar";
import { BasicInfoForm, BasicInfoData }  from "@/components/profile/BasicInfoForm";
import { SecurityForm }                  from "@/components/profile/SecurityForm";
import { PersonalPreferences }           from "@/components/settings/PersonalPreferences";
import { DashboardPageHero }             from "@/components/shared/DashboardPageHero";
import { toast } from "sonner";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"info" | "security" | "preferences">("info");
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState<BasicInfoData>({
    fullName: "", email: "", phone: "",
    alternatePhone: "", role: "CUSTOMER",
    nidNumber: "", isNidLocked: false,
  });
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res  = await fetch("/api/profile/update", { headers });
      const json = await res.json();

      if (json.success && json.data) {
        setProfileData({
          fullName:      json.data.fullName      || "",
          email:         json.data.email         || "",
          phone:         json.data.phone         || "",
          alternatePhone: json.data.alternatePhone || "",
          role:          json.data.role          || "CUSTOMER",
          nidNumber:     json.data.nidNumber     || "",
          isNidLocked:   json.data.isNidLocked   || false,
        });
        setAvatarUrl(json.data.profileImage || "");
      } else {
        toast.error(json.message || "Failed to load profile details");
      }
    } catch { toast.error("Network error while fetching profile"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveBasicInfo = async (updated: Partial<BasicInfoData>) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res  = await fetch("/api/profile/update", {
      method: "PUT", headers,
      body: JSON.stringify({ ...updated, profileImage: avatarUrl }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Update failed");
    await fetchProfile();
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res  = await fetch("/api/profile/password", {
      method: "POST", headers,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Password change failed");
  };

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
        onAvatarChange={(newUrl) => {
          setAvatarUrl(newUrl);
          handleSaveBasicInfo({ fullName: profileData.fullName, alternatePhone: profileData.alternatePhone });
        }}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-border gap-4 sm:gap-6">
        {[
          { id: "info"        as const, label: "Basic Info",           icon: User     },
          { id: "security"    as const, label: "Security & Password",  icon: KeyRound },
          { id: "preferences" as const, label: "Preferences",          icon: Bell     },
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
        {activeTab === "info"        && <BasicInfoForm initialData={profileData} onSave={handleSaveBasicInfo} />}
        {activeTab === "security"    && <SecurityForm onChangePassword={handleChangePassword} />}
        {activeTab === "preferences" && <PersonalPreferences />}
      </div>
    </div>
  );
}
