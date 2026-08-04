"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function DashboardBottomBar() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector("main");
      if (!mainEl) return;

      const scrollTop = mainEl.scrollTop;
      const scrollHeight = mainEl.scrollHeight;
      const clientHeight = mainEl.clientHeight;

      // Threshold: consider at bottom if within 60px of the page end
      const reachesBottom = scrollHeight - (scrollTop + clientHeight) <= 60;
      setIsAtBottom(reachesBottom);
    };

    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Check on mount
    }

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] w-full pointer-events-none overflow-hidden select-none pb-4 pt-8">
      {/* Full-width Graphical Wave & Dot Grid Background */}
      <div
        className={`absolute bottom-0 left-0 right-0 w-full h-16 sm:h-20 backdrop-blur-[2px] transition-all duration-500 ease-out ${
          isAtBottom ? "opacity-50 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Secondary Background Wave */}
        <svg
          className="absolute bottom-0 right-0 w-full h-full text-blue-600/25"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,20 C200,100 400,-20 650,60 C900,140 1050,10 1200,40 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>

        {/* Primary Foreground Wave */}
        <svg
          className="absolute bottom-0 right-0 w-full h-full text-indigo-600/20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,50 C150,110 350,10 600,70 C850,130 1050,30 1200,80 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>

        {/* Dot Matrix Pattern Overlay */}
        <div
          className="absolute right-6 bottom-1 w-64 h-14 opacity-75"
          style={{
            backgroundImage: "radial-gradient(#2563eb 2px, transparent 2px)",
            backgroundSize: "10px 10px",
          }}
        />
      </div>

      {/* Scroll-Dependent "Need Help" Capsule */}
      <div className="relative z-10 flex items-center justify-center">
        <Link
          href="/dashboard/help-desk"
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/95 hover:bg-white text-slate-900 border border-blue-200/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 ease-out transform ${
            isAtBottom
              ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
              : "translate-y-10 opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <span className="p-1.5 rounded-full bg-blue-600 text-white shadow-xs group-hover:scale-110 transition-transform">
            <MessageSquare size={16} />
          </span>
          <span className="text-xs sm:text-sm text-slate-700">
            <strong className="text-slate-900 font-extrabold">Need help?</strong>{" "}
            <span className="text-slate-600 font-medium">Our support team is here for you 24/7</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
