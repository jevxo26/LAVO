import { Navber } from "@/components/Navber";
import { PricingCalculator } from "@/components/pricing/PricingCalculator";
import { PageHero } from "@/components/shared/PageHero";
import { Footer } from "@/components/Footer";
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
    return page?.sections.find(s => s.sectionKey === key) || null;
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navber />
      
      <div className="flex-1">
        <PageHero data={getSection("hero")} />
        
        <div className="my-12 md:my-16 lg:my-20 relative z-20">
          <PricingCalculator data={getSection("calculator")} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
