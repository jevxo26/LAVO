import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/shared/PageHero";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { ServicePromise } from "@/components/services/ServicePromise";
import { Footer } from "@/components/Footer";
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
    return page?.sections.find(s => s.sectionKey === key) || null;
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
