import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Services } from "@/components/home/Services";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { QRTracking } from "@/components/home/QRTracking";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navber />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <Hero />

        {/* Statistics Section */}
        <Stats />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Services Section */}
        <Services />

        {/* Why Choose LAUNDRIX Section */}
        <WhyChooseUs />

        {/* QR Tracking Preview */}
        <QRTracking />

        {/* Testimonials Section */}
        <Testimonials />

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
