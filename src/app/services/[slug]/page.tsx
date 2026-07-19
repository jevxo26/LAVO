import { notFound } from "next/navigation";
import { Navber } from "@/components/Navber";
import { Footer } from "@/components/Footer";
import { serviceDetails } from "@/data/servicesDetails";
import { ServiceDetailsHero } from "@/components/services/details/ServiceDetailsHero";
import { ServiceIncludes } from "@/components/services/details/ServiceIncludes";
import { ServiceProcess } from "@/components/services/details/ServiceProcess";
import { ServiceFAQ } from "@/components/services/details/ServiceFAQ";

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: PageProps) {
  const service = serviceDetails[params.slug as keyof typeof serviceDetails];
  
  if (!service) {
    return {
      title: "Service Not Found | Laundrix"
    };
  }

  return {
    title: `${service.title} | Laundrix Services`,
    description: service.description,
  };
}

export default function ServiceDetailsPage({ params }: PageProps) {
  const service = serviceDetails[params.slug as keyof typeof serviceDetails];

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navber />
      
      <div className="flex-1">
        <ServiceDetailsHero
          title={service.title}
          isPremium={service.isPremium}
          description={service.description}
          startingPrice={service.startingPrice}
          turnaround={service.turnaround}
          coverage={service.coverage}
          imageUrl={service.imageUrl}
        />
        
        <ServiceIncludes includes={service.includes} />
        <ServiceProcess process={service.process} />
        <ServiceFAQ faqs={service.faqs} />
      </div>

      <Footer />
    </main>
  );
}
