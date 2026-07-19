import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeServices } from "@/components/home/HomeServices";
import { HomeProcess } from "@/components/home/HomeProcess";
import { HomeWhyLaundrix } from "@/components/home/HomeWhyLaundrix";
import { HomeQRTracking } from "@/components/home/HomeQRTracking";
import { HomeCoverage } from "@/components/home/HomeCoverage";
import { HomeCorporate } from "@/components/home/HomeCorporate";
import { HomePartnership } from "@/components/home/HomePartnership";
import { HomeBranches } from "@/components/home/HomeBranches";
import { HomeMobileApp } from "@/components/home/HomeMobileApp";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeCTA } from "@/components/home/HomeCTA";
import prisma from "@/lib/prisma";


export const revalidate = 0; // Force dynamic to always fetch the latest CMS data

export default async function Home() {
  const homePage = await prisma.cmsPage.findUnique({
    where: { slug: "home" },
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
    return homePage?.sections.find(s => s.sectionKey === key) || null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navber />

      <main className="flex-1 relative z-10 pt-20">
        <HomeHero data={getSection("hero")} />
        <HomeServices data={getSection("services")} />
        <HomeProcess data={getSection("process")} />
        <HomeWhyLaundrix data={getSection("why-laundrix")} />
        <HomeQRTracking data={getSection("qr-tracking")} />
        <HomeCoverage data={getSection("coverage")} />
        <HomeCorporate data={getSection("corporate")} />
        <HomePartnership data={getSection("partnership")} />
        <HomeBranches data={getSection("branches")} />
        <HomeMobileApp data={getSection("mobile-app")} />
        <HomeTestimonials data={getSection("testimonials")} />
        <HomeFAQ data={getSection("faq")} />
        <HomeCTA data={getSection("cta")} />
      </main>

      <Footer />
    </div>
  );
}
