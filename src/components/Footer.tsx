"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full relative z-10 border-t border-white/20 bg-white/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent">
              LAUNDRIX
            </span>
            <p className="mt-4 text-slate-600 max-w-sm">
              Smart laundry pickup & delivery service across Bangladesh.
              QR-tracked, professional, and reliable.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20v-7.21H5.62v-2.87h2.67V7.47c0-2.64 1.62-4.09 3.99-4.09 1.13 0 2.11.08 2.39.12v2.77h-1.64c-1.29 0-1.54.61-1.54 1.51V9.92h3.08l-4 2.87v7.21z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-0.5 7-0.5z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Wash Only
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Wash + Iron
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Dry Cleaning
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Premium Care
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center md:flex md:justify-between md:text-left">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} LAUNDRIX. All rights reserved.
          </p>
          <div className="flex items-center justify-center md:justify-end gap-1 text-slate-600 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart size={16} className="text-red-500 fill-red-500" />
            <span>in Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
