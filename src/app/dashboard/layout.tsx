"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { useAppSelector } from "@/store/store";
import { toast } from "sonner";

function UnauthorizedCheck() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("unauthorized") === "1") {
      toast.error("You don't have permission to access that page.");
      const url = new URL(window.location.href);
      url.searchParams.delete("unauthorized");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  // Fallback client-side auth guard (middleware is the primary guard)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <React.Suspense fallback={null}>
        <UnauthorizedCheck />
      </React.Suspense>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
