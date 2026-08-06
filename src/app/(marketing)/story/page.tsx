import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageHero } from "@/components/shared/PageHero";
import Journey from "@/components/marketing/story/Journey";
import LeadershipTeam from "@/components/marketing/story/LeadershipTeam";
import Mission from "@/components/marketing/story/Mission";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "About Us | The LAUNDRIX Story",
  description: "Learn about the LAUNDRIX mission, journey, and leadership team.",
};

export default async function StoryPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "story" },
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
    subtitle: heroSection?.subtitle || "About Us",
    title: heroSection?.title || "The LAUNDRIX Story",
    content:
      heroSection?.content ||
      "From a single location to a city-wide platform serving thousands daily.",
  };

  return (
    <div>
      <Navbar />
      <div className="flex-1">
        <PageHero data={heroData} />
        <Mission />
        <Journey />
        <LeadershipTeam />
      </div>
      <Footer />
    </div>
  );
}
