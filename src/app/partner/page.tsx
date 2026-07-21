import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { LocationCard } from "@/components/corporate/LocationCard";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Our Partners | Laundrix",
  description: "Find authorized LAUNDRIX vendors and partners.",
};

export default async function PartnerPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "partner" },
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
  const vendorsSection = getSection("vendors");

  const defaultVendors = [
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

  type VendorItem = { name: string; city: string; address: string | null; hours: string; phone: string };

  const displayVendors: VendorItem[] = (vendorsSection?.items?.length ?? 0) > 0
    ? vendorsSection!.items.map((item) => {
        const parts = item.subtitle?.split('·') ?? [];
        return {
          name: item.title ?? "",
          city: "Vendor",
          address: item.content,
          hours: parts[0]?.trim() ?? "Mon-Sun 8am-10pm",
          phone: "+880 1711-000000"
        };
      })
    : defaultVendors;

  return (
    <main className="min-h-screen flex flex-col bg-surface-light">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        <PageHero data={heroSection} />
        
        {/* Vendors Grid Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-surface-light">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVendors.map((vendor, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                  <LocationCard 
                    name={vendor.name}
                    city={vendor.city}
                    address={vendor.address || ""}
                    phone={vendor.phone}
                    hours={vendor.hours}
                    isVendor={true}
                  />
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
