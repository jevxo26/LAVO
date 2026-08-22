import { Navbar } from "@/components/layout/Navbar";
import { PageHero } from "@/components/shared/PageHero";
import { ServicesGrid } from "@/components/marketing/services/ServicesGrid";
import { ServicePromise } from "@/components/marketing/services/ServicePromise";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function ServicesPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "services" },
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
        <ServicesGrid data={getSection("services-grid")} />
        <ServicePromise data={getSection("promise")} />
      </div>

      <Footer />
    </main>
  );
}
