import ContactSection from "@/components/marketing/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageHero } from "@/components/shared/PageHero";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Contact Us | Laundrix",
  description: "Get in touch with the LAUNDRIX support team.",
};

export default async function GetInTouchPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "contact" },
    include: {
      sections: {
        include: {
          items: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });

  const getSection = (key: string) => {
    return page?.sections.find((s: any) => s.sectionKey === key) || null;
  };

  const heroSection = getSection("hero");
  const heroData = {
    subtitle: heroSection?.subtitle || "Contact",
    title: heroSection?.title || "Get in Touch",
    content: heroSection?.content || "We respond to all inquiries within 2 business hours.",
  };

  return (
    <div>
      <Navbar />
      <div className="flex-1">
        <PageHero data={heroData} />
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
