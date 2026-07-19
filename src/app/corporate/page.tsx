import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/shared/PageHero";
import { 
  Building2, 
  Box, 
  RefreshCw, 
  Mail, 
  ShieldCheck, 
  Zap,
  Users,
  Shield,
  Globe,
  Activity,
  Star,
  ArrowRight
} from "lucide-react";
import prisma from "@/lib/prisma";


export const revalidate = 0;

export const metadata = {
  title: "Corporate | Laundrix",
  description: "Enterprise Laundry Solutions for businesses.",
};

export default async function CorporatePage() {
  const page = await prisma.cmsPage.findUnique({
    where: { slug: "corporate" },
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

  const businessFeatures = [
    {
      title: "Dedicated Account Manager",
      description: "A single point of contact for all your laundry operations.",
      icon: Building2,
    },
    {
      title: "Flexible Volume Pricing",
      description: "Tiered pricing that scales proportionally with your weekly volume.",
      icon: Box,
    },
    {
      title: "Recurring Pickup Schedule",
      description: "Fixed pickup days and times that fit your operational rhythm.",
      icon: RefreshCw,
    },
    {
      title: "Consolidated Invoicing",
      description: "One weekly or monthly invoice with full line-item detail.",
      icon: Mail,
    },
    {
      title: "Full Liability Coverage",
      description: "All corporate items insured against damage or loss.",
      icon: ShieldCheck,
    },
    {
      title: "Express Priority Lane",
      description: "Jump the queue with guaranteed same-day processing for urgent items.",
      icon: Zap,
    }
  ];

  const industries = [
    {
      title: "Hotels & Resorts",
      description: "Linens, towels, uniforms",
      icon: Building2,
    },
    {
      title: "Restaurants",
      description: "Table linens, chef whites",
      icon: Users,
    },
    {
      title: "Healthcare",
      description: "Scrubs, lab coats",
      icon: Shield,
    },
    {
      title: "Corporate Offices",
      description: "Dry cleaning accounts",
      icon: Globe,
    },
    {
      title: "Gyms & Spas",
      description: "Towels, robes, mats",
      icon: Activity,
    },
    {
      title: "Film & Media",
      description: "Costume care, wardrobe",
      icon: Star,
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navber />
      
      <div className="flex-1 flex flex-col">
        <PageHero data={heroSection} />
        
        {/* Main Content Section */}
        <section className="w-full py-16 lg:py-24 bg-slate-50">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              
              {/* Left Column: Built for Business Scale */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Business Scale</h2>
                <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-lg">
                  LAUNDRIX Corporate provides volume pricing, dedicated account management, flexible pickup schedules, and consolidated invoicing for organisations processing 100+ items per week.
                </p>
                
                <div className="flex flex-col gap-8">
                  {businessFeatures.map((feature, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <feature.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{feature.title}</h4>
                        <p className="text-sm text-slate-500">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Industries We Serve */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Industries We Serve</h2>
                <p className="text-slate-500 mb-8 text-sm">
                  Tailored solutions for every industry vertical.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {industries.map((industry, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <industry.icon size={20} className="text-blue-500 mb-3" />
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{industry.title}</h4>
                      <p className="text-xs text-slate-400">{industry.description}</p>
                    </div>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-100/80 rounded-2xl p-5 border border-blue-100/50 text-center flex flex-col justify-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">2K+</div>
                    <div className="text-[10px] text-slate-500">Items/week capacity</div>
                  </div>
                  <div className="bg-blue-100/80 rounded-2xl p-5 border border-blue-100/50 text-center flex flex-col justify-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">200+</div>
                    <div className="text-[10px] text-slate-500">Corporate clients</div>
                  </div>
                  <div className="bg-blue-100/80 rounded-2xl p-5 border border-blue-100/50 text-center flex flex-col justify-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">99%</div>
                    <div className="text-[10px] text-slate-500">On-time delivery</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Request a Corporate Quote Form */}
            <div className="mt-24 max-w-3xl mx-auto">
              <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Request a Corporate Quote</h2>
                <p className="text-slate-500 text-sm mb-8">Tell us about your needs and we&apos;ll respond within 2 business hours.</p>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Smith" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Company</label>
                      <input 
                        type="text" 
                        placeholder="Acme Corp" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Email</label>
                      <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+880 1700-123458" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Weekly Volume</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Message</label>
                    <textarea 
                      placeholder="Tell us about your laundry requirements..." 
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="button" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-colors mt-4"
                  >
                    Submit Inquiry <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
