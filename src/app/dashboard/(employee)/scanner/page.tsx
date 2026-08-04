"use client";

import { useAuth } from "@/hooks/useAuth";
import { ScannerLogin } from "@/components/shared/scanner/ScannerLogin";
import { ScannerView } from "@/components/shared/scanner/ScannerPage";

export default function DashboardScannerPage() {
  const { user, token } = useAuth();

  // If user is logged in, show the full-screen standalone scanner
  if (token && user) return <ScannerView user={user} />;

  // Otherwise show the scanner login form
  return <ScannerLogin onLogin={(_, u) => {}} />;
}
