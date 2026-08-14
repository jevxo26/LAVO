"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, CircleDollarSign, Landmark, Sliders, Bell } from "lucide-react";
import { PersonalPreferences, PreferenceSettings } from "@/components/settings/PersonalPreferences";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { useAuth }   from "@/hooks/useAuth";
import { authFetch } from "@/lib/api";
import Link from "next/link";

export default function GenericSettingsPage() {
  const { user } = useAuth();
  const [activeTab,    setActiveTab]    = useState<"preferences" | "system">("preferences");
  const [prefSettings, setPrefSettings] = useState<Partial<PreferenceSettings>>({});

  // Normalise role using the same logic as dashboard/page.tsx
  const rawRole    = (user as any)?.role || (user as any)?.userType || "";
  const userRole   = rawRole.toUpperCase().trim().replace(/[\s-]+/g, "_") || "CUSTOMER";
  const isSuperAdmin = ["SUPER_ADMIN", "SUPERADMIN"].includes(userRole);

  // Load persisted notification preferences from Express
  useEffect(() => {
    authFetch("/profile/preferences")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setPrefSettings({
            emailNotification:    json.data.emailNotification    ?? true,
            pushNotification:     json.data.pushNotification     ?? true,
            smsNotification:      json.data.smsNotification      ?? true,
            marketingNotification: json.data.marketingNotification ?? false,
          });
        }
      })
      .catch(() => { /* non-critical — component shows defaults */ });
  }, []);

  return (
    <div className="w-full space-y-6">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Platform & Personal Settings"
        title="Settings"
        description="Manage your personal alert preferences and view platform configuration."
        icon={Settings}
        chips={[{ label: "Role", value: userRole }]}
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-black border-b-2 transition-all ${
            activeTab === "preferences"
              ? ""
              : "border-transparent text-muted-foreground hover:text-card-foreground"
          }`}
          style={activeTab === "preferences" ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
        >
          <Bell size={17} /> Personal Preferences
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-black border-b-2 transition-all ${
              activeTab === "system"
                ? ""
                : "border-transparent text-muted-foreground hover:text-card-foreground"
            }`}
            style={activeTab === "system" ? { borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
          >
            <ShieldCheck size={17} /> System Administration
          </button>
        )}
      </div>

      {/* ── Tab Panels ───────────────────────────────────────────────────────── */}
      <div>
        {activeTab === "preferences" && (
          <PersonalPreferences initialSettings={prefSettings} />
        )}

        {activeTab === "system" && isSuperAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                href:        "/dashboard/system-settings/pricing-tax",
                icon:        CircleDollarSign,
                title:       "Pricing & Tax Rules",
                description: "Configure delivery base fee, express multipliers, and global VAT tax rates.",
                cta:         "Configure Pricing",
                gradient:    "from-blue-500 to-indigo-600",
              },
              {
                href:        "/dashboard/system-settings/financial-rules",
                icon:        Landmark,
                title:       "Financial Rules",
                description: "Set vendor commission percentages and minimum payout thresholds.",
                cta:         "Configure Finance",
                gradient:    "from-indigo-500 to-violet-600",
              },
              {
                href:        "/dashboard/system-settings/feature-flags",
                icon:        Sliders,
                title:       "Feature Flags",
                description: "Toggle wallet cashback, promo codes, SMS gateway, and vendor marketplace modules.",
                cta:         "Manage Feature Flags",
                gradient:    "from-emerald-500 to-teal-600",
              },
            ].map(({ href, icon: Icon, title, description, cta, gradient }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-ring/40 hover:shadow-md transition-all"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-black text-card-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">{description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-black mt-4"
                  style={{ color: "var(--primary)" }}>
                  {cta} &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
