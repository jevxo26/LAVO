"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, QrCode, LogIn, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Coverage", href: "/coverage" },
  { name: "Corporate", href: "/corporate" },
  { name: "Partner", href: "/partner" },
];

export function Navber() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const links = isAuthenticated 
    ? [...navLinks, { name: "Dashboard", href: "/dashboard" }]
    : navLinks;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
            <ShoppingBag size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            LAUNDRIX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {links.map((item) => {
            const isActive = pathname === item.href || (item.name === "Services" && pathname.startsWith("/services"));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-primary" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            href="/track"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <QrCode size={16} />
            Track Order
          </Link>
          
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}

          <Link
            href="/book"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25"
          >
            Book Pickup
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-600 hover:text-primary focus:outline-none p-2 rounded-md transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b shadow-lg p-4 flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            {links.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium px-4 py-2 rounded-md ${
                  pathname === item.href ? "bg-primary/5 text-primary" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Link href="/track" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium">
              <QrCode size={16} /> Track Order
            </Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-slate-700 text-sm font-medium">
              <LogIn size={16} /> Login
            </Link>
            <Link href="/book" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-medium">
              Book Pickup <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

