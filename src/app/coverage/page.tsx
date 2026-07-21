import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityCard } from "@/components/coverage/CityCard";
import MapWrapper from "@/components/coverage/MapWrapper";
import { MapPin } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Coverage Area | Laundrix",
  description: "Find out if LAUNDRIX is available in your area.",
};

export default async function CoveragePage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "coverage" },
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

  const heroSection = getSection("hero");
  const citiesSection = getSection("cities");

  const defaultCities = [
    { city: "Dhaka", isAvailable: true },
    { city: "Chittagong", isAvailable: true },
    { city: "Sylhet", isAvailable: true },
    { city: "Rajshahi", isAvailable: true },
    { city: "Khulna", isAvailable: true },
    { city: "Rangpur", isAvailable: true },
    { city: "Barisal", isAvailable: true },
    { city: "San Comilla", isAvailable: true },
    { city: "Mymensingh", isAvailable: true },
    { city: "Narayanganj", isAvailable: true },
    { city: "Rangamati", isAvailable: true },
    { city: "Khagrachari", isAvailable: true },
  ];

  type CityItem = { city: string; isAvailable: boolean };

  const displayCities: CityItem[] = (citiesSection?.items?.length ?? 0) > 0
    ? citiesSection!.items.map((item) => ({
        city: item.title ?? "",
        isAvailable: item.subtitle?.toLowerCase() === "available"
      }))
    : defaultCities;

  return (
    <main className="min-h-screen flex flex-col bg-surface-light">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        <PageHero data={heroSection} />

        {/* Content Section overlapping the hero */}
        <div className="max-w-7xl w-full mx-auto px-4 md:px-6 relative z-20">
          
          {/* Search Card */}
          <div className="bg-white rounded-[24px] p-6 my-8 shadow-xl border border-slate-100 max-w-3xl mx-auto mb-8">
            <h3 className="text-slate-900 font-bold text-sm mb-4 ml-1">Check Your Address</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter zip code or neighborhood..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm">
                Check
              </button>
            </div>
          </div>

          {/* Map Section */}
          <MapWrapper />
          
        </div>

        {/* Cities Grid Section */}
        <section className="w-full py-16 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            
            <div className="text-center mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{citiesSection?.title || "Coverage by Area"}</h2>
              <p className="text-sm text-slate-500">
                {citiesSection?.subtitle || "LAUNDRIX currently operates across New York City and surrounding areas."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayCities.map((item, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                  <CityCard city={item.city} isAvailable={item.isAvailable} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
