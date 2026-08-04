"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/store";
import { logoutThunk } from "@/store/slices/authSlice";

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
  unreadNotificationsCount = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    if (typeof window !== "undefined") {
      localStorage.removeItem("laundrix_token");
      document.cookie = "laundrix_token=; path=/; max-age=0";
    }
    router.replace("/login");
  };

  const initials = fullName
    ? fullName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* Notification Bell Icon */}
      <button
        type="button"
        className="relative w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-700 shadow-2xs transition-all hover:scale-105"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Profile Avatar Dropdown Trigger */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
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

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/80 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate">{fullName || "User"}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{email || "user@laundrix.com"}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase rounded-md">
                <Shield size={10} /> {userRole || "CUSTOMER"}
              </span>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={15} className="text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings size={15} className="text-slate-400" />
                <span>Settings & Preferences</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
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
