import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { MapPin, Clock, Phone } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export const metadata = {
  title: "Our Branches | Laundrix Corporate",
  description: "Find your nearest LAUNDRIX branch.",
};

export default async function BranchesPage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "branches" },
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

  const defaultBranches = [
    {
      name: "Gulshan Branch",
      region: "Gulshan, Dhaka",
      address: "Road 90, Gulshan-2, Dhaka",
      phone: "+880 1700-123457",
      hours: "Sat-Thu 8:00 AM-10:00 PM",
    },
    {
      name: "Uttara Branch",
      region: "Sector 7, Uttara",
      address: "House 12, Sector 7, Uttara, Dhaka",
      phone: "+880 1700-123458",
      hours: "Sat-Thu 8:00 AM-9:00 PM",
    },
    {
      name: "Banani Branch",
      region: "Banani, Dhaka",
      address: "Road 11, Banani, Dhaka",
      phone: "+880 1700-123458",
      hours: "Sat-Thu 8:00 AM-9:00 PM",
    },
    {
      name: "Chattogram Branch",
      region: "Agrabad, Chattogram",
      address: "Agrabad Commercial Area, Chattogram",
      phone: "+880 1700-123460",
      hours: "Sat-Thu 8:00 AM-9:00 PM",
    },
    {
      name: "Dhanmondi Branch",
      region: "Dhanmondi, Dhaka",
      address: "House 32, Road 7, Dhanmondi, Dhaka",
      phone: "+880 1700-123456",
      hours: "Sat-Thu 8:00 AM-9:00 PM",
    },
    {
      name: "Sylhet Branch",
      region: "Zindabazar, Sylhet",
      address: "Zindabazar Main Road, Sylhet",
      phone: "+880 1700-123458",
      hours: "Sat-Thu 8:00 AM-9:00 PM",
    }
  ];

  type BranchItem = { name: string; region: string; address: string | null; hours: string; phone: string };

  const displayBranches: BranchItem[] = (heroSection?.items?.length ?? 0) > 0
    ? heroSection!.items.map((item) => {
        const parts = item.subtitle?.split('·') ?? [];
        return {
          name: item.title ?? "",
          region: "Branch",
          address: item.content,
          hours: parts[0]?.trim() ?? "Sat-Thu 8:00 AM-9:00 PM",
          phone: "+880 1700-000000"
        };
      })
    : defaultBranches;

  return (
    <main className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navber />

      <div className="flex-1 flex flex-col">
        <PageHero data={heroSection} />

        {/* Locations Grid Section */}
        <section className="w-full py-12 md:py-16 bg-[#F8FAFC]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side: Branch Cards (2 columns on md) */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayBranches.map((branch, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">{branch.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {branch.region}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 flex-1">
                      <p className="text-sm text-slate-600">{branch.address}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={14} />
                        <span>{branch.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={14} />
                        <span>{branch.phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto pt-3 border-t border-slate-100">
                      <button className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                        Directions
                      </button>
                      <button className="w-full py-2.5 rounded-xl bg-[#1f5df9] text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                        Book Pickup
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side: Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Map View Card */}
                <div className="bg-[#F1F5F9] rounded-2xl p-8 h-[240px] flex flex-col items-center justify-center text-center border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Branch Map View</h3>
                  <p className="text-xs text-slate-500">All locations across Bangladesh</p>
                </div>

                {/* Standard Branch Hours Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-6 text-sm">Standard Branch Hours</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-50">
                      <span className="text-slate-500">Monday–Friday</span>
                      <span className="font-semibold text-slate-900">6am – 10pm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-50">
                      <span className="text-slate-500">Saturday</span>
                      <span className="font-semibold text-slate-900">7am – 9pm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Sunday</span>
                      <span className="font-semibold text-slate-900">9am – 6pm</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
