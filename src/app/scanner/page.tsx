"use client";

import { useAuth } from "@/hooks/useAuth";
import { ScannerLogin } from "@/components/scanner/ScannerLogin";
import { ScannerView } from "@/components/scanner/ScannerPage";

export default function ScannerRoute() {
  const { user, token } = useAuth();

  // If user is already logged in via the main dashboard, go straight to the scanner
  if (token && user) return <ScannerView user={user} />;

  // Otherwise show the scanner-specific login form
  return <ScannerLogin onLogin={(_, u) => {}} />;
}
