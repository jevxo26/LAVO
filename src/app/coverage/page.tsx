import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { SearchSection } from "@/components/shared/SearchSection";
import { WaitlistSection } from "@/components/shared/WaitlistSection";
import { CityCard } from "@/components/coverage/CityCard";

export const metadata = {
  title: "Coverage Area | Laundrix",
  description: "Find out if LAUNDRIX is available in your area.",
};

const cities = [
  { city: "Dhaka", isAvailable: true },
  { city: "Sylhet", isAvailable: true },
  { city: "Rajshahi", isAvailable: true },
  { city: "Khulna", isAvailable: true },
  { city: "Rangpur", isAvailable: true },
  { city: "Barisal", isAvailable: true },
  { city: "Mymensingh", isAvailable: true },
  { city: "Narayanganj", isAvailable: true },
  { city: "Rangamati", isAvailable: true },
  { city: "Cumilla", isAvailable: true },
  { city: "Bandarban", isAvailable: true },
  { city: "Faridpur", isAvailable: true },
];

export default function CoveragePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navber />
      
      <div className="flex-1 flex flex-col">
        <PageHero 
          badgeText="Coverage Area"
          title="We Serve 15+ Cities"
          description="Find out if LAUNDRIX is available in your area. We expand to new cities every quarter."
        />
        
        <SearchSection placeholder="Search your city or zip code..." />

        {/* Cities Grid Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cities.map((item, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                  <CityCard city={item.city} isAvailable={item.isAvailable} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <WaitlistSection />
      </div>

      <Footer />
    </main>
  );
}
