"use client";

import { useAuth }      from "@/hooks/useAuth";
import { ScannerLogin } from "@/components/shared/scanner/ScannerLogin";
import { ScannerView }  from "@/components/shared/scanner/ScannerPage";

export default function DashboardScannerPage() {
  const { user, token } = useAuth();

  // ── Authenticated → show scanner ─────────────────────────────────────────
  if (token && user) return <ScannerView user={user} />;

  // ── Not authenticated → show login ───────────────────────────────────────
  // ScannerLogin writes token to localStorage then calls onLogin.
  // window.location.reload() causes useAuth to rehydrate from localStorage,
  // which updates Redux state and renders ScannerView on the next mount.
  return <ScannerLogin onLogin={() => window.location.reload()} />;
}
