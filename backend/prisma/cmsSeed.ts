import prisma from "../src/lib/prisma";

export async function seedCmsDefaults() {
  const pagesData = [
    {
      slug: "home",
      title: "Home / Landing Page",
      description: "Main website homepage content",
      sections: [
        { sectionKey: "hero", title: "Premium Eco-Friendly Laundry & Dry Cleaning", subtitle: "Schedule instant pickup in seconds. Professional care for suits, silk sarees, and everyday garments.", content: "Cleaned with care, delivered to your doorstep." },
        { sectionKey: "services", title: "Our Laundry Services", subtitle: "Full-service fabric care tailored to your garments." },
        { sectionKey: "process", title: "How Laundrix Works", subtitle: "Simple 4-step laundry process from door to door." },
        { sectionKey: "why-laundrix", title: "Why Choose Laundrix?", subtitle: "Modern tech, eco-friendly detergents, 24/7 support." },
        { sectionKey: "faq", title: "Frequently Asked Questions", subtitle: "Everything you need to know about our services." },
        { sectionKey: "cta", title: "Ready to Experience Premium Laundry?", subtitle: "Book your first pickup now and get 20% off." },
      ],
    },
    {
      slug: "services",
      title: "Services & Dry Cleaning Catalog",
      description: "Full service catalog page",
      sections: [
        { sectionKey: "hero", title: "Professional Fabric Care & Dry Cleaning", subtitle: "Services", content: "From delicate silk care to industrial laundry solutions." },
        { sectionKey: "services-grid", title: "All Available Services", subtitle: "Select your required cleaning type." },
        { sectionKey: "promise", title: "The Laundrix Quality Guarantee", subtitle: "100% garment protection guarantee." },
      ],
    },
    {
      slug: "pricing",
      title: "Transparent Pricing & Calculator",
      description: "Pricing rates and dynamic calculator",
      sections: [
        { sectionKey: "hero", title: "Simple, Transparent Pricing", subtitle: "Pricing", content: "No hidden fees. Pay only for what you wash." },
        { sectionKey: "calculator", title: "Interactive Price Estimator", subtitle: "Calculate your estimated order total instantly." },
      ],
    },
    {
      slug: "story",
      title: "About Laundrix & Our Story",
      description: "Company story, mission, and leadership",
      sections: [
        { sectionKey: "hero", title: "The LAUNDRIX Story", subtitle: "About Us", content: "From a single location to a city-wide platform serving thousands daily." },
        { sectionKey: "mission", title: "Our Mission & Core Values", subtitle: "Sustainable fabric care and technology empowerment." },
        { sectionKey: "journey", title: "Our Growth Journey", subtitle: "Milestones from inception to market leadership." },
        { sectionKey: "leadership", title: "Meet Our Leadership Team", subtitle: "Passionate innovators building the future of laundry." },
      ],
    },
    {
      slug: "contact",
      title: "Contact Us & Support",
      description: "Customer service contact information",
      sections: [
        { sectionKey: "hero", title: "Get in Touch", subtitle: "Contact", content: "We respond to all inquiries within 2 business hours." },
        { sectionKey: "contact-info", title: "Customer Support Line", subtitle: "Support 24/7: +880 1711-000000 | Email: support@laundrix.com" },
      ],
    },
    {
      slug: "coverage",
      title: "Coverage Area & Hubs",
      description: "City coverage and service availability",
      sections: [
        { sectionKey: "hero", title: "Service Coverage Area", subtitle: "Coverage", content: "Operating across major cities with instant pickup dispatch." },
        { sectionKey: "cities", title: "Active Operating Cities", subtitle: "Available in Dhaka, Chittagong, Sylhet, and major metropolitan areas." },
      ],
    },
    {
      slug: "corporate",
      title: "Corporate & Commercial B2B",
      description: "Enterprise laundry solutions",
      sections: [
        { sectionKey: "hero", title: "Enterprise Commercial Laundry Solutions", subtitle: "Corporate B2B", content: "Custom high-volume laundry contracts for hotels, hospitals, and airlines." },
        { sectionKey: "features", title: "Corporate Account Benefits", subtitle: "Dedicated account manager, volume discounts, flexible invoicing." },
      ],
    },
    {
      slug: "partner",
      title: "Partner & Vendor Registration",
      description: "Partner vendor network and application",
      sections: [
        { sectionKey: "hero", title: "Partner With LAUNDRIX", subtitle: "Vendor Network", content: "Grow your laundry business with our digital order stream." },
        { sectionKey: "vendors", title: "Authorized Partner Outlets", subtitle: "Join hundreds of certified Laundrix partner hubs." },
      ],
    },
    {
      slug: "insights",
      title: "Insights & Fabric Care Blog",
      description: "Articles, news, and fabric care tips",
      sections: [
        { sectionKey: "hero", title: "Insights & Fabric Resources", subtitle: "Blog & News", content: "Expert advice, garment care tips, and platform updates." },
        { sectionKey: "articles", title: "Latest Fabric Care Articles", subtitle: "Tips from our dry cleaning experts." },
      ],
    },
  ];

  for (const p of pagesData) {
    const page = await prisma.cmsPage.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        status: "PUBLISHED",
      },
      update: {
        title: p.title,
        description: p.description,
      },
    });

    for (const [index, sec] of p.sections.entries()) {
      await prisma.cmsSection.upsert({
        where: { pageId_sectionKey: { pageId: page.id, sectionKey: sec.sectionKey } },
        create: {
          pageId: page.id,
          sectionKey: sec.sectionKey,
          title: sec.title,
          subtitle: sec.subtitle,
          content: sec.content || null,
          displayOrder: index,
        },
        update: {
          title: sec.title,
          subtitle: sec.subtitle,
          content: sec.content || null,
        },
      });
    }
  }
}
