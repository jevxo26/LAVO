import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getServiceDetails } from "@/data/servicesDetails";
import { ServiceDetailsHero } from "@/components/marketing/services/details/ServiceDetailsHero";
import { ServiceIncludes } from "@/components/marketing/services/details/ServiceIncludes";
import { ServiceProcess } from "@/components/marketing/services/details/ServiceProcess";
import { ServiceFAQ } from "@/components/marketing/services/details/ServiceFAQ";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceDetails(slug);
  
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

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceDetails(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
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

