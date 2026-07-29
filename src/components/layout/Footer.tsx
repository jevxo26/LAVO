"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0f1c] text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-12">
          {/* Logo and About */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white">
                <ShoppingBag size={16} />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">
                LAUNDR<span className="text-primary">IX</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-8 max-w-sm text-slate-400">
              Managed Multi-Branch & Multi-Vendor Laundry Operating System.
              Built for Bangladesh.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Links - Company */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">
              Company
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Press Kit
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Products */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">
              Products
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Customer App
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Branch Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Operations
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Solutions */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">
              Solutions
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Corporate Laundry
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Hotels & Hospitality
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Healthcare
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Franchise Network
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Support */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">
              Support
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Coverage Map
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Service Status
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-500 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-slate-800 pt-10 pb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-white font-bold mb-1">Stay updated</h4>
            <p className="text-sm">
              New cities, features, and platform updates.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2 flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-slate-800/50 border border-slate-700 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 w-full sm:w-[300px]"
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-2.5 rounded-full transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-slate-500">
            <p>© {new Date().getFullYear()} LAUNDRIX</p> |
            <p>All rights reserved</p> |
            <p>
              Developed by{" "}
              <Link
                href="https://www.jevxo.com"
                className="hover:text-white hover:underline transition-colors"
              >
                <span className="text-blue-400 font-bold">Jevxo</span>
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
