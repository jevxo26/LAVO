import { Navber } from "@/components/Navber";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServicesGrid } from "@/components/services/ServicesGrid";
import { ServicePromise } from "@/components/services/ServicePromise";
import { Footer } from "@/components/Footer";

export default function ServicesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navber />
      
      <div className="flex-1">
        <ServicesHero />
        <ServicesGrid />
        <ServicePromise />
      </div>

      {/* Assuming there is a Footer component somewhere, otherwise it can be removed */}
      <Footer />
    </main>
  );
}
