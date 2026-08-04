"use client";

import React, { useState, useEffect } from "react";
import { Bell, Mail, Sun, Moon, Save, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export interface PreferenceSettings {
  emailNotification: boolean;
  pushNotification: boolean;
  theme: "light" | "dark" | "system";
}

interface PersonalPreferencesProps {
  initialSettings?: Partial<PreferenceSettings>;
  onSavePreferences?: (settings: PreferenceSettings) => Promise<void>;
}

export const PersonalPreferences: React.FC<PersonalPreferencesProps> = ({
  initialSettings,
  onSavePreferences,
}) => {
  const { theme, setTheme } = useTheme();

  const [prefs, setPrefs] = useState<PreferenceSettings>({
    emailNotification: initialSettings?.emailNotification ?? true,
    pushNotification: initialSettings?.pushNotification ?? true,
    theme: (theme as "light" | "dark") || "light",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setPrefs({
        emailNotification: initialSettings.emailNotification ?? true,
        pushNotification: initialSettings.pushNotification ?? true,
        theme: (theme as "light" | "dark") || "light",
      });
    }
  }, [initialSettings, theme]);

  const toggleToggle = (key: "emailNotification" | "pushNotification") => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
        const res = await fetch("/api/profile/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save settings");
      }
      toast.success("Personal preferences updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="text-blue-600" size={20} /> Personal Preferences & Display
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your personal notifications and theme preferences.</p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
        {/* Email Notifications */}
        <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl mt-0.5">
              <Mail size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive order confirmations, status alerts, and receipts via email.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleToggle("emailNotification")}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              prefs.emailNotification ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                prefs.emailNotification ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="pt-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl mt-0.5">
              <Bell size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive instant browser push alerts for order updates and dispatches.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleToggle("pushNotification")}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              prefs.pushNotification ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                prefs.pushNotification ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Dark/Light Mode Theme Toggle */}
        <div className="pt-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl mt-0.5">
              {prefs.theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Theme & Display Mode</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Switch between Light Mode and Dark Mode for the application interface.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                prefs.theme === "light"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                prefs.theme === "dark"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};
