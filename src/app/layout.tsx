import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/shared/ReduxProvider";
import { Toaster } from "sonner";

const baiJamjuree = Bai_Jamjuree({
  variable: "--font-bai-jamjuree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Laundrix — Smart Laundry & Dry Cleaning Platform",
  description: "Experience premium door-to-door laundry & dry cleaning with live QR tracking, express pickup, and instant online payments.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baiJamjuree.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ReduxProvider>{children}</ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
