"use client";

import React, { useState, useEffect } from "react";
import { Bell, Mail, Sun, Moon, Save, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreferenceSettings {
  emailNotification:   boolean;
  pushNotification:    boolean;
  smsNotification:     boolean;
  marketingNotification: boolean;
  theme: "light" | "dark";
}

interface PersonalPreferencesProps {
  initialSettings?: Partial<PreferenceSettings>;
  onSavePreferences?: (settings: PreferenceSettings) => Promise<void>;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getToken(): string {
  return typeof window !== "undefined"
    ? (localStorage.getItem("laundrix_token") ?? "")
    : "";
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PersonalPreferences: React.FC<PersonalPreferencesProps> = ({
  initialSettings,
  onSavePreferences,
}) => {
  const { theme, setTheme } = useTheme();

  const [prefs, setPrefs] = useState<PreferenceSettings>({
    emailNotification:   initialSettings?.emailNotification   ?? true,
    pushNotification:    initialSettings?.pushNotification    ?? true,
    smsNotification:     initialSettings?.smsNotification     ?? true,
    marketingNotification: initialSettings?.marketingNotification ?? false,
    theme: (theme as "light" | "dark") || "light",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync when parent passes updated initialSettings
  useEffect(() => {
    if (initialSettings) {
      setPrefs((prev) => ({
        emailNotification:   initialSettings.emailNotification   ?? prev.emailNotification,
        pushNotification:    initialSettings.pushNotification    ?? prev.pushNotification,
        smsNotification:     initialSettings.smsNotification     ?? prev.smsNotification,
        marketingNotification: initialSettings.marketingNotification ?? prev.marketingNotification,
        theme: (theme as "light" | "dark") || prev.theme,
      }));
    }
  }, [initialSettings, theme]);

  const togglePref = (key: keyof Omit<PreferenceSettings, "theme">) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setPrefs((prev) => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onSavePreferences) {
        await onSavePreferences(prefs);
      } else {
        // Fix #1 — include Authorization header
        const token = getToken();
        const res = await fetch("/api/profile/preferences", {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          // Fix #5 — include all 4 notification fields so nothing is reset to default
          body: JSON.stringify({
            emailNotification:   prefs.emailNotification,
            pushNotification:    prefs.pushNotification,
            smsNotification:     prefs.smsNotification,
            marketingNotification: prefs.marketingNotification,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save settings");
      }
      toast.success("Preferences updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    } finally { setIsLoading(false); }
  };

  // ── Preference row ────────────────────────────────────────────────────────
  const PrefRow = ({
    icon: Icon, title, description, checked, onToggle,
  }: {
    icon: React.ElementType; title: string; description: string;
    checked: boolean; onToggle: () => void;
  }) => (
    <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-muted text-muted-foreground mt-0.5">
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-black text-card-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        style={{ background: checked ? "var(--primary)" : "var(--muted-foreground)" }}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-black text-card-foreground flex items-center gap-2">
          <Bell size={20} style={{ color: "var(--primary)" }} /> Personal Preferences & Display
        </h3>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Configure your personal notifications and theme preferences.
        </p>
      </div>

      <div className="divide-y divide-border space-y-4">
        <PrefRow
          icon={Mail} title="Email Notifications"
          description="Receive order confirmations, status alerts, and receipts via email."
          checked={prefs.emailNotification}
          onToggle={() => togglePref("emailNotification")}
        />
        <PrefRow
          icon={Bell} title="Push Notifications"
          description="Receive instant browser push alerts for order updates and dispatches."
          checked={prefs.pushNotification}
          onToggle={() => togglePref("pushNotification")}
        />

        {/* Theme toggle */}
        <div className="pt-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-muted text-muted-foreground mt-0.5">
              {prefs.theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <h4 className="text-sm font-black text-card-foreground">Theme & Display Mode</h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Switch between Light Mode and Dark Mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                prefs.theme === "light"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                prefs.theme === "dark"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-black shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Preferences
        </button>
      </div>
    </div>
  );
};
