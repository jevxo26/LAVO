import BlogSection from "@/components/marketing/blog/BlogSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageHero } from "@/components/shared/PageHero";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Insights & Resources | Laundrix",
  description: "Expert fabric care advice, news, and insights from Laundrix.",
};

export default async function InsightsResourcesPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "insights" },
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
  const heroData = {
    subtitle: heroSection?.subtitle || "Blog",
    title: heroSection?.title || "Insights & Resources",
    content:
      heroSection?.content ||
      "Expert advice, industry news, and behind-the-scenes stories from the LAUNDRIX team.",
  };

  return (
    <div>
      <Navbar />
      <div className="flex-1">
        <PageHero data={heroData} />
        <BlogSection />
      </div>
      <Footer />
    </div>
  );
}
