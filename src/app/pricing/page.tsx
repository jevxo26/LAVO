import { Navber } from "@/components/Navber";
import { ServicesHero } from "@/components/services/ServicesHero";
import { PricingCalculator } from "@/components/pricing/PricingCalculator";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Pricing | Laundrix",
  description: "Transparent pricing for all your laundry needs.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navber />
      
      <div className="flex-1">
        {/* Reusing the ServicesHero as it matches the design perfectly */}
        <ServicesHero />
        
        {/* The new interactive pricing calculator */}
        <PricingCalculator />
      </div>

      <Footer />
    </main>
  );
}
