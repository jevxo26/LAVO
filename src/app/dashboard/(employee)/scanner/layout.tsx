import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garment Scanner | LAVO",
  description: "Employee QR scanner for real-time garment status updates.",
};

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  // Standalone layout — no sidebar or navbar
  return <>{children}</>;
}
