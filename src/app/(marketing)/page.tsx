import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeHero } from "@/components/marketing/home/HomeHero";
import { HomeServices } from "@/components/marketing/home/HomeServices";
import { HomeProcess } from "@/components/marketing/home/HomeProcess";
import { HomeWhyLaundrix } from "@/components/marketing/home/HomeWhyLaundrix";
import { HomeQRTracking } from "@/components/marketing/home/HomeQRTracking";
import { HomeCoverage } from "@/components/marketing/home/HomeCoverage";
import { HomeCorporate } from "@/components/marketing/home/HomeCorporate";
import { HomePartnership } from "@/components/marketing/home/HomePartnership";
import { HomeBranches } from "@/components/marketing/home/HomeBranches";
import { HomeMobileApp } from "@/components/marketing/home/HomeMobileApp";
import { HomeTestimonials } from "@/components/marketing/home/HomeTestimonials";
import { HomeFAQ } from "@/components/marketing/home/HomeFAQ";
import { HomeCTA } from "@/components/marketing/home/HomeCTA";
import prisma from "@/lib/prisma";
import HomePricing from "@/components/marketing/home/HomePricing";

export const revalidate = 0; // Always fetch latest CMS + review data

export default async function Home() {
  // ── CMS sections ───────────────────────────────────────────────────────────
  let homePage = null;
  try {
    homePage = await prisma.cmsPage.findUnique({
      where: { slug: "home" },
      include: {
        sections: {
          include: {
            items: { orderBy: { displayOrder: 'asc' } }
          }
        }
      }
    });
  } catch (err) {
    console.error("Error fetching home page CMS data:", err);
  }

  const getSection = (key: string) =>
    homePage?.sections.find(s => s.sectionKey === key) || null;

  // ── Published customer reviews for testimonials ────────────────────────────
  let publishedReviews: any[] = [];
  try {
    publishedReviews = await prisma.review.findMany({
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
  } catch (err) {
    console.error("Error fetching home page reviews:", err);
  }

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

      <main className="flex-1 relative z-10 pt-16 bg-surface-light">
        <HomeHero data={getSection("hero")} />
        <HomeServices data={getSection("services")} />
        <HomeProcess data={getSection("process")} />
        <HomeWhyLaundrix data={getSection("why-laundrix")} />
        <HomeQRTracking data={getSection("qr-tracking")} />
        <HomeCoverage data={getSection("coverage")} />
        <HomePricing data={getSection("pricing")} />
        <HomeCorporate data={getSection("corporate")} />
        <HomePartnership data={getSection("partnership")} />
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
