import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { CorporateQuoteForm } from "@/components/marketing/corporate/CorporateQuoteForm";
import {
  Building2,
  Box,
  RefreshCw,
  Mail,
  ShieldCheck,
  Zap,
  Users,
  Shield,
  Globe,
  Activity,
  Star,
} from "lucide-react";
import prisma from "@/lib/prisma";
import CorporateContent from "@/components/marketing/corporate/CorporateContent";

export const revalidate = 0;

export const metadata = {
  title: "Corporate B2B | Laundrix",
  description: "Enterprise laundry solutions for hotels, hospitals, and corporate clients.",
};

export default async function CorporatePage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "corporate" },
    include: {
      sections: {
        include: {
          items: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });

  const getSection = (key: string) => {
    return page?.sections.find((s) => s.sectionKey === key) || null;
  };

  const heroSection = getSection("hero");
  const featuresSection = getSection("features");

  const businessFeatures = [
    { title: "Dedicated Account Manager", description: "A single point of contact for all your laundry operations.", icon: Building2 },
    { title: "Flexible Volume Pricing", description: "Tiered pricing that scales proportionally with your weekly volume.", icon: Box },
    { title: "Recurring Pickup Schedule", description: "Fixed pickup days and times that fit your operational rhythm.", icon: RefreshCw },
    { title: "Consolidated Invoicing", description: "One weekly or monthly invoice with full line-item detail.", icon: Mail },
    { title: "Full Liability Coverage", description: "All corporate items insured against damage or loss.", icon: ShieldCheck },
    { title: "Express Priority Lane", description: "Jump the queue with guaranteed same-day processing for urgent items.", icon: Zap },
  ];

  const industries = [
    { title: "Hotels & Resorts", description: "Linens, towels, uniforms", icon: Building2 },
    { title: "Restaurants", description: "Table linens, chef whites", icon: Users },
    { title: "Healthcare", description: "Scrubs, lab coats", icon: Shield },
    { title: "Corporate Offices", description: "Dry cleaning accounts", icon: Globe },
    { title: "Gyms & Spas", description: "Towels, robes, mats", icon: Activity },
    { title: "Film & Media", description: "Costume care, wardrobe", icon: Star },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-surface-light">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <PageHero data={heroSection} />
        <CorporateContent featuresSection={featuresSection} />
      </div>
      <Footer />
    </main>
  );
}
