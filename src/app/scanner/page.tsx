"use client";

import { useEffect, useState } from "react";
import { ScannerLogin } from "@/components/scanner/ScannerLogin";
import { ScannerView } from "@/components/scanner/ScannerPage";

export default function ScannerRoute() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("laundrix_token");
    const stored = localStorage.getItem("laundrix_user");
    if (token && stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) return <ScannerLogin onLogin={(_, u) => setUser(u)} />;
  return <ScannerView user={user} />;
}
