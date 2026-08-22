import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PricingCalculator } from "@/components/marketing/pricing/PricingCalculator";
import { PageHero } from "@/components/shared/PageHero";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Pricing | Laundrix",
  description: "Transparent pricing for all your laundry needs.",
};

export default async function PricingPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "pricing" },
    include: {
      sections: {
        include: {
          items: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      }
    }
  });

  const getSection = (key: string) => {
    return page?.sections.find((s: any) => s.sectionKey === key) || null;
  };

  return (
    <main className="min-h-screen flex flex-col bg-surface-light">
      <Navbar />
      
      <div className="flex-1">
        <PageHero data={getSection("hero")} />
        
        <div className="my-12 md:my-16 lg:my-20 relative z-20">
          <Suspense fallback={<div className="text-center py-10">Loading pricing calculator...</div>}>
            <PricingCalculator data={getSection("calculator")} />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
