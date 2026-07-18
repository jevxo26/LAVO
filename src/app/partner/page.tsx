import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { SearchSection } from "@/components/shared/SearchSection";
import { WaitlistSection } from "@/components/shared/WaitlistSection";
import { LocationCard } from "@/components/corporate/LocationCard";

export const metadata = {
  title: "Our Partners | Laundrix",
  description: "Find authorized LAUNDRIX vendors and partners.",
};

const vendors = [
  {
    name: "Clean & Fresh Hub",
    city: "Dhaka",
    address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
    phone: "+880 1711-000001",
    hours: "Mon-Sun 8am-10pm",
  },
  {
    name: "Premium Wash Care",
    city: "Dhaka",
    address: "Gulshan Avenue, Gulshan 2, Dhaka 1212",
    phone: "+880 1711-000002",
    hours: "Mon-Sat 7am-9pm · Sun 8am-6pm",
  },
  {
    name: "Sparkle Laundry Services",
    city: "Chattogram",
    address: "GEC Circle, Nasirabad, Chattogram 4000",
    phone: "+880 1711-000003",
    hours: "Mon-Sat 8am-8pm",
  },
  {
    name: "Sylhet Dry Cleaners",
    city: "Sylhet",
    address: "Zindabazar, Sylhet 3100",
    phone: "+880 1711-000004",
    hours: "Mon-Sun 9am-9pm",
  },
  {
    name: "Rajshahi Wash Depot",
    city: "Rajshahi",
    address: "Shaheb Bazar, Rajshahi 6000",
    phone: "+880 1711-000005",
    hours: "Mon-Sat 8am-8pm",
  },
  {
    name: "Khulna Care Service",
    city: "Khulna",
    address: "Shib Bari More, Khulna 9000",
    phone: "+880 1711-000006",
    hours: "Mon-Sun 8am-8pm",
  }
];

export default function PartnerPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navber />
      
      <div className="flex-1 flex flex-col">
        <PageHero 
          badgeText="Our Partners"
          title="Authorized Vendors"
          description="Find an authorized LAUNDRIX vendor near you. Our partners adhere to strict quality guidelines to ensure premium service."
        />
        
        <SearchSection placeholder="Search vendors by city or area..." />

        {/* Vendors Grid Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-slate-50">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                  <LocationCard 
                    name={vendor.name}
                    city={vendor.city}
                    address={vendor.address}
                    phone={vendor.phone}
                    hours={vendor.hours}
                    isVendor={true}
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
