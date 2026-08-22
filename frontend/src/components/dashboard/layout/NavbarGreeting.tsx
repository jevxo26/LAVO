"use client";

import React, { useState, useEffect } from "react";

interface NavbarGreetingProps {
  fullName?: string;
  userRole?: string;
}

export const NavbarGreeting: React.FC<NavbarGreetingProps> = ({
  fullName = "User",
  userRole,
}) => {
  const [greeting, setGreeting] = useState("Good Evening");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const firstName = fullName?.trim() ? fullName.trim().split(" ")[0] : "User";

  return (
    <div className="flex flex-col justify-center min-w-0">
      <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
        <span>{greeting}, {firstName}</span>
        <span className="inline-block animate-bounce-short">👋</span>
      </h1>
      <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
        Let's get your clothes looking their best today.
      </p>
    </div>
  );
};
