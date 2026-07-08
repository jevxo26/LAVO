"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navItems } from "@/data/navdata";

export function Navber() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent"
          >
            LAUNDRIX
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}

          <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/30">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-400/40 transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden relative items-center">
          <button 
            onClick={()=> setIsOpen(!isOpen)}
            className="text-slate-600 hover:text-blue-600 focus:outline-none p-2 rounded-md hover:bg-white/50 transition-colors">
            {isOpen ? <X size={24}/> : <Menu size={24} />}
          </button>
          {isOpen && (
            <div 
              className="md:hidden absolute top-8 right-0 bg-white flex flex-col border py-4 px-6 rounded-md shadow-lg space-y-3"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t pt-2 mt-2 flex flex-col space-y-2">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg transition-all" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
