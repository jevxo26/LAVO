"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/store";
import { logoutThunk } from "@/store/slices/authSlice";
import { NavbarNotificationDropdown, NotificationItem } from "./NavbarNotificationDropdown";

interface NavbarUserMenuProps {
  fullName: string;
  email: string;
  userRole: string;
  avatarUrl?: string;
  unreadNotificationsCount?: number;
}

export const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({
  fullName,
  email,
  userRole,
  avatarUrl,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      if (!token) return;

      const res = await fetch("/api/notifications/my-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount ?? 0);
      }
    } catch {
      // Fallback silently if offline
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      if (!token) return;

      const res = await fetch("/api/notifications/my-notifications", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // Silent error handling
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    if (typeof window !== "undefined") {
      localStorage.removeItem("laundrix_token");
      document.cookie = "laundrix_token=; path=/; max-age=0";
    }
    router.replace("/login");
  };

  const initials = fullName
    ? fullName.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* Notification Bell Dropdown */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsNotifOpen(!isNotifOpen);
            setIsProfileOpen(false);
          }}
          className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs transition-all hover:scale-105"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {isNotifOpen && (
          <NavbarNotificationDropdown
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClose={() => setIsNotifOpen(false)}
          />
        )}
      </div>

      {/* Profile Avatar Dropdown Trigger */}
      <div ref={profileRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsNotifOpen(false);
          }}
          className="flex items-center gap-1.5 p-0.5 rounded-full hover:opacity-90 transition-opacity focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-2xs bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <ChevronDown size={14} className="text-slate-500 hover:text-slate-800 transition-colors" />
        </button>

        {/* User Menu Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{fullName || "User"}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{email || "user@laundrix.com"}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px] font-bold uppercase rounded-md">
                <Shield size={10} /> {userRole || "CUSTOMER"}
              </span>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={15} className="text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings size={15} className="text-slate-400" />
                <span>Settings & Preferences</span>
              </Link>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
