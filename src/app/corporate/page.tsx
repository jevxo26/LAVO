import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { SearchSection } from "@/components/shared/SearchSection";
import { WaitlistSection } from "@/components/shared/WaitlistSection";
import { LocationCard } from "@/components/corporate/LocationCard";

export const metadata = {
  title: "Our Branches | Laundrix Corporate",
  description: "Find your nearest LAUNDRIX branch.",
};

const branches = [
  {
    name: "Downtown Manhattan",
    city: "New York",
    address: "145 W 45th Street, New York, NY 10036",
    phone: "+1 212-555-0101",
    hours: "Mon-Sat 7am-9pm · Sun 8am-6pm",
  },
  {
    name: "Brooklyn Heights",
    city: "New York",
    address: "87 Montague Street, Brooklyn, NY 11201",
    phone: "+1 718-555-0102",
    hours: "Mon-Sat 7am-9pm · Sun 8am-6pm",
  },
  {
    name: "River North",
    city: "Chicago",
    address: "340 W Erie Street, Chicago, IL 60654",
    phone: "+1 312-555-0301",
    hours: "Mon-Sat 7am-8pm · Sun 9am-5pm",
  },
  {
    name: "Beverly Hills",
    city: "Los Angeles",
    address: "90210 Wilshire Blvd, Beverly Hills, CA 90210",
    phone: "+1 310-555-0201",
    hours: "Mon-Sun 8am-10pm",
  },
  {
    name: "Santa Monica",
    city: "Los Angeles",
    address: "1520 Ocean Ave, Santa Monica, CA 90401",
    phone: "+1 310-555-0202",
    hours: "Mon-Sun 8am-10pm",
  },
  {
    name: "Wicker Park",
    city: "Chicago",
    address: "1611 N Damen Ave, Chicago, IL 60647",
    phone: "+1 312-555-0302",
    hours: "Mon-Sat 7am-8pm · Sun 9am-5pm",
  }
];

export default function CorporatePage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navber />
      
      <div className="flex-1 flex flex-col">
        <PageHero 
          badgeText="Our Branches"
          title="50+ Locations Nationwide"
          description="Find your nearest LAUNDRIX branch. Every location delivers the same premium service standard."
        />
        
        <SearchSection placeholder="Search your city or zip code..." />

        {/* Locations Grid Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-slate-50">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                  <LocationCard 
                    name={branch.name}
                    city={branch.city}
                    address={branch.address}
                    phone={branch.phone}
                    hours={branch.hours}
                  />
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
