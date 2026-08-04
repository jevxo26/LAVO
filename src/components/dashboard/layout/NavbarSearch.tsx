"use client";

import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface NavbarSearchProps {
  onSearchChange?: (val: string) => void;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({ onSearchChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex items-center w-full max-w-md mx-auto">
      <div className="relative w-full group">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none"
        />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search for services, orders, or anything..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-11 pr-14 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/60 focus:border-blue-400/60 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs"
        />

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-400 shadow-2xs pointer-events-none">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>
    </div>
  );
};
