"use client";

import React, { useEffect, useState } from "react";
import { NavbarGreeting } from "./NavbarGreeting";
import { NavbarSearch } from "./NavbarSearch";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { useAppSelector } from "@/store/store";

export function Navbar() {
  const reduxUser = useAppSelector((s) => s.auth.user);

  const [userInfo, setUserInfo] = useState({
    fullName: reduxUser?.fullName || "User",
    email: reduxUser?.email || "",
    userRole: reduxUser?.userType || "CUSTOMER",
    avatarUrl: reduxUser?.profileImage || "",
  });

  // Keep state synchronized with Redux user or fetch profile details
  useEffect(() => {
    if (reduxUser) {
      setUserInfo({
        fullName: reduxUser.fullName || "User",
        email: reduxUser.email || "",
        userRole: (reduxUser.userType || "CUSTOMER").toUpperCase().replace(/\s+/g, "_"),
        avatarUrl: reduxUser.profileImage || "",
      });
      return;
    }

    // Fallback: Fetch user details from profile endpoint or token decode
    const loadProfileFallback = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        if (!token) return;

        // Decode JWT token for fast initial display
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          const rawRole = payload?.role || payload?.userType || "CUSTOMER";
          setUserInfo((prev) => ({
            ...prev,
            email: payload?.email || prev.email,
            userRole: rawRole.toUpperCase().replace(/\s+/g, "_"),
          }));
        }

        // Fetch authoritative profile details
        const res = await fetch("/api/profile/update", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setUserInfo({
            fullName: json.data.fullName || "User",
            email: json.data.email || "",
            userRole: (json.data.role || "CUSTOMER").toUpperCase().replace(/\s+/g, "_"),
            avatarUrl: json.data.profileImage || "",
          });
        }
      } catch {
        // Fallback silently if unauthenticated
      }
    };

    loadProfileFallback();
  }, [reduxUser]);

  return (
    <header className="w-full bg-gradient-to-r from-blue-50/50 via-slate-50/80 to-indigo-50/40 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-2xs">
      {/* Dynamic Greeting */}
      <div className="shrink-0 max-w-[240px] sm:max-w-xs">
        <NavbarGreeting fullName={userInfo.fullName} userRole={userInfo.userRole} />
      </div>

      {/* Pill Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <NavbarSearch userRole={userInfo.userRole} />
      </div>

      {/* Right Notifications & Profile Menu */}
      <NavbarUserMenu
        fullName={userInfo.fullName}
        email={userInfo.email}
        userRole={userInfo.userRole}
        avatarUrl={userInfo.avatarUrl}
        unreadNotificationsCount={3}
      />
    </header>
  );
}
