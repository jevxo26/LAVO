import { Navbar } from "@/components/Navbar";
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

export const revalidate = 0; // Always fetch latest CMS + review data

export default async function Home() {
  // ── CMS sections ───────────────────────────────────────────────────────────
  const homePage = await prisma.cmsPage.findUnique({
    where: { slug: "home" },
    include: {
      sections: {
        include: {
          items: { orderBy: { displayOrder: 'asc' } }
        }
      }
    }
  });

  const getSection = (key: string) =>
    homePage?.sections.find(s => s.sectionKey === key) || null;

  // ── Published customer reviews for testimonials ────────────────────────────
  const publishedReviews = await prisma.review.findMany({
    where: { status: 'PUBLISHED' },
    take: 10,
    include: {
      customer: { include: { user: { select: { fullName: true } } } },
      order: {
        include: {
          items: {
            take: 1,
            include: { service: { select: { serviceName: true } } },
          },
        },
      },
    },
    orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
  });

  const reviews = publishedReviews.map((r) => ({
    id:           r.id,
    customerName: r.customer?.user?.fullName || 'Customer',
    initials:     (r.customer?.user?.fullName || 'CU')
                    .split(' ')
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase(),
    rating:       r.rating,
    comment:      r.review,
    title:        (r as any).title ?? null,
    serviceName:  r.order?.items?.[0]?.service?.serviceName || 'Laundry Service',
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pt-16">
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
        <HomeTestimonials
          data={getSection("testimonials")}
          reviews={reviews}
        />
        <HomeFAQ data={getSection("faq")} />
        <HomeCTA data={getSection("cta")} />
      </main>

      <Footer />
    </div>
  );
}
