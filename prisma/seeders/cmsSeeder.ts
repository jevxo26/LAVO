import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runCmsSeeder() {
  console.log("Seeding CMS Data...");

  const pagesData = [
    {
      slug: "home",
      title: "Laundrix Homepage",
      description: "The main landing page for Laundrix",
      sections: [
        {
          key: "hero",
          title: "Smart Laundry, Perfectly Delivered.",
          subtitle: "Book pickup in under a minute. We wash, dry clean, iron and deliver your clothes safely across Dhaka, Chattogram, Sylhet and beyond.",
          order: 1,
          items: [
            { title: "QR Tracking", icon: "QrCode" },
            { title: "Secure Payment", icon: "Shield" },
            { title: "On-Time Delivery", icon: "Truck" },
            { title: "Verified Service", icon: "CheckCircle" },
          ]
        },
        { key: "services", title: "Everything Your Wardrobe Needs", subtitle: "From everyday wash & fold to luxury garment care — handled with professional precision and tracked in real time.", order: 2, items: [] },
        {
          key: "process",
          title: "Six Steps to Perfectly Clean",
          subtitle: "From a single tap to delivery at your door — every step tracked, automated, and transparent.",
          order: 3,
          items: [
            { title: "Book", subtitle: "01", content: "Schedule your pickup in under 60 seconds.", icon: "Calendar" },
            { title: "Pickup", subtitle: "02", content: "We collect at your chosen time window.", icon: "Truck" },
            { title: "QR Tagging", subtitle: "03", content: "Every garment gets a unique QR identity.", icon: "QrCode" },
            { title: "Processing", subtitle: "04", content: "Expert cleaning using premium products.", icon: "Sparkles" },
            { title: "Quality Check", subtitle: "05", content: "Multi-point inspection before packaging.", icon: "ShieldCheck" },
            { title: "Delivery", subtitle: "06", content: "Clean clothes returned to your door.", icon: "Package" }
          ]
        },
        {
          key: "why-laundrix",
          title: "The Standard Others Try to Match",
          subtitle: "LAUNDRIX combines enterprise-grade reliability with consumer-level simplicity. Every feature — from QR tracking to multi-branch management — is designed to save you time and eliminate laundry anxiety.",
          order: 4,
          items: [
            { title: "Technology-First", content: "QR tracking, real-time updates, and digital receipts for every order.", icon: "Zap" },
            { title: "Garment Insurance", content: "Every item fully insured. Zero risk, zero worry for your wardrobe.", icon: "ShieldCheck" },
            { title: "City-Wide Network", content: "24 branches across 8 cities for maximum convenience.", icon: "Globe" },
            { title: "Dedicated Support", content: "Human support available via chat, phone, or email.", icon: "Users" }
          ]
        },
        { key: "qr-tracking", title: "Every Garment Has an Identity", subtitle: "Each item receives a unique QR code at pickup. Scan it anytime from any device to see real-time status — from intake through cleaning, pressing, and delivery.", order: 5, items: [] },
        { key: "coverage", title: "We Come to You", subtitle: "Check if LAUNDRIX serves your area. Pickup available 7 days a week.", order: 6, items: [] },
        {
          key: "corporate",
          title: "Enterprise Solutions for Your Business",
          subtitle: "Dedicated solutions for hotels, restaurants, healthcare, and large enterprises. Volume pricing, weekly invoicing, and a dedicated account team.",
          order: 7,
          items: [
            { title: "Hotels & Resorts", icon: "Building2" },
            { title: "Restaurants", icon: "UtensilsCrossed" },
            { title: "Healthcare", icon: "Stethoscope" },
            { title: "Corporations", icon: "Briefcase" }
          ]
        },
        {
          key: "partnership",
          title: "Grow your business with LAUNDRIX",
          subtitle: "Join our partner network and access thousands of orders, powerful dashboard tools, and reliable weekly payouts.",
          order: 8,
          items: [
            { title: "Laundry Partner", content: "Own a laundry facility? Receive a steady stream of orders from our platform.", icon: "Store", subtitle: "bg-blue-600" },
            { title: "Branch Partner", content: "Operate a collection point and manage pickups with full LAUNDRIX support.", icon: "Building", subtitle: "bg-purple-600" },
            { title: "Delivery Partner", content: "Join our rider network and earn by delivering clean laundry across your city.", icon: "Truck", subtitle: "bg-emerald-600" },
            { title: "Pickup Agent", content: "Become a LAUNDRIX agent in your neighbourhood and earn commission per pickup.", icon: "User", subtitle: "bg-orange-500" }
          ]
        },
        {
          key: "branches",
          title: "Find a Branch Near You",
          subtitle: "",
          order: 9,
          items: [
            { title: "Downtown Hub", content: "42 Commerce St, Downtown", subtitle: "Mon-Sat 7am-9pm · Sun 9am-6pm" },
            { title: "Midtown Express", content: "118 Park Ave, Midtown", subtitle: "Mon-Fri 6am-10pm · Sat-Sun 8am-8pm" },
            { title: "Brooklyn Central", content: "55 Atlantic Ave, Brooklyn", subtitle: "Mon-Sat 7am-9pm · Sun 10am-5pm" },
            { title: "Queens Plaza", content: "200 Northern Blvd, Queens", subtitle: "Daily 7am-9pm" }
          ]
        },
        {
          key: "mobile-app",
          title: "Laundry management in your pocket",
          subtitle: "Book pickups, track every garment with QR, make payments, and manage your entire laundry life from our beautifully designed mobile app.",
          order: 10,
          items: [
            { title: "Live Tracking", content: "Real-time order & rider", icon: "MapPin" },
            { title: "QR Scanner", content: "Scan any garment status", icon: "QrCode" },
            { title: "Notifications", content: "Instant order updates", icon: "Bell" },
            { title: "Wallet", content: "Pay & manage balance", icon: "Wallet" },
            { title: "Order History", content: "All past orders", icon: "Clock" },
            { title: "Reviews", content: "Rate your experience", icon: "Star" }
          ]
        },
        {
          key: "testimonials",
          title: "What Our Customers Say",
          subtitle: "",
          order: 11,
          items: [
            { title: "Sarah Mitchell", content: "\"LAUNDRIX changed my morning routine entirely. QR tracking is brilliant — I always know exactly where my dry cleaning is in real time.\"", subtitle: "SM" },
            { title: "James Thompson", content: "\"We use LAUNDRIX for all our staff uniforms. Bulk pricing is excellent and quality is consistently outstanding every week.\"", subtitle: "JT" },
            { title: "Priya Sharma", content: "\"Reliable, professional, perfectly cleaned every time. I wouldn't trust anyone else with my scrubs. Peace of mind is invaluable.\"", subtitle: "PS" },
            { title: "Marcus Reid", content: "\"Running a 200-room hotel means we need reliable service every day. LAUNDRIX delivers without exception. Our guests always notice.\"", subtitle: "MR" }
          ]
        },
        {
          key: "faq",
          title: "Common Questions",
          subtitle: "Quick answers. Our full FAQ page covers everything else.",
          order: 12,
          items: [
            { title: "How does pickup scheduling work?", content: "You can schedule a pickup through our mobile app or website. Choose a convenient 1-hour time slot, and our delivery agent will arrive to collect your garments in our provided reusable bags.", subtitle: "Pickup" },
            { title: "Which cities are covered?", content: "We currently cover all major metropolitan areas including Dhaka, Chattogram, and Sylhet. Check our coverage map for detailed service areas.", subtitle: "Coverage" },
            { title: "How is pricing calculated?", content: "Pricing is transparent and based per item or by weight depending on the service selected. You can view full pricing in the app before confirming your order.", subtitle: "Pricing" },
            { title: "How does QR garment tracking work?", content: "Upon pickup, each item is tagged with a unique QR code. This allows you to track its exact status in real-time through the app, from cleaning to delivery.", subtitle: "Tracking" },
            { title: "What payment methods are accepted?", content: "We accept all major credit/debit cards, mobile banking (bKash, Nagad), and cash on delivery.", subtitle: "Payments" }
          ]
        },
        { key: "cta", title: "Ready for Clean, On Demand?", subtitle: "Join 12,000+ customers who trust LAUNDRIX for premium garment care.", order: 13, items: [] }
      ]
    },
    // Services Page
    {
      slug: "services",
      title: "Services",
      description: "Professional Laundry Services",
      sections: [
        {
          key: "hero",
          title: "Professional Laundry Services",
          subtitle: "Our Services",
          content: "Every garment deserves expert care. From everyday essentials to delicate designer pieces — we have a service for every wardrobe.",
          order: 1,
          items: []
        },
        {
          key: "services-grid",
          title: "Our Services Grid",
          subtitle: "",
          content: "",
          order: 2,
          items: [
            { title: "Wash & Fold", subtitle: "৳45 | kg | 12-24 hrs", content: "Professional washing with precision folding for everyday garments.", image: "https://images.unsplash.com/photo-1582735689141-c11bb356c6d5?auto=format&fit=crop&q=80&w=800" },
            { title: "Dry Cleaning", subtitle: "৳150 | pc | 12-24 hrs", content: "Expert solvent cleaning for delicate, formal, and specialty garments.", image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800" },
            { title: "Ironing & Press", subtitle: "৳30 | pc | 12-24 hrs", content: "Crisp, wrinkle-free garments finished to a professional standard.", image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800" },
            { title: "Stain Removal", subtitle: "৳100 | pc | 24-48 hrs", content: "Advanced treatment for stubborn stains without damaging the fabric.", image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800" },
            { title: "Commercial Laundry", subtitle: "Custom | order | 24-48 hrs", content: "Bulk laundry solutions tailored for hotels, hospitals, and businesses.", image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800" },
            { title: "Express Laundry", subtitle: "৳80 | kg | 6-12 hrs", content: "Fast-tracked washing and folding services for your urgent requirements.", image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&q=80&w=800" },
          ]
        },
        {
          key: "promise",
          title: "Our Quality Promise",
          subtitle: "We stand behind every garment we process.",
          order: 3,
          items: [
            { title: "Eco-Friendly Products", content: "We use biodegradable detergents that are tough on stains but gentle on the environment and your skin.", icon: "Leaf" },
            { title: "Expert Care", content: "Our team is trained in advanced fabric care, ensuring each material receives the specific treatment it requires.", icon: "ShieldCheck" },
            { title: "Satisfaction Guaranteed", content: "Not completely satisfied? We will re-clean your items at no additional cost. Your happiness is our priority.", icon: "Award" }
          ]
        }
      ]
    },
    // Pricing Page
    {
      slug: "pricing",
      title: "Pricing",
      description: "Transparent pricing for all your laundry needs.",
      sections: [
        {
          key: "hero",
          title: "Know your pricing before you book",
          subtitle: "Live Pricing",
          content: "Transparent pricing. No surprises at delivery.",
          order: 1,
          items: []
        },
        {
          key: "calculator",
          title: "Pricing Calculator",
          subtitle: "Estimate your cost instantly",
          order: 2,
          items: [
            // --- Garments (subtitle: "garment", content: basePrice) ---
            { title: "Shirts",       subtitle: "garment", content: "40",  displayOrder: 1 },
            { title: "T-Shirts",     subtitle: "garment", content: "30",  displayOrder: 2 },
            { title: "Pants",        subtitle: "garment", content: "45",  displayOrder: 3 },
            { title: "Jeans",        subtitle: "garment", content: "50",  displayOrder: 4 },
            { title: "Suits",        subtitle: "garment", content: "200", displayOrder: 5 },
            { title: "Blazers",      subtitle: "garment", content: "150", displayOrder: 6 },
            { title: "Sarees",       subtitle: "garment", content: "120", displayOrder: 7 },
            { title: "Punjabis",     subtitle: "garment", content: "80",  displayOrder: 8 },
            { title: "Jackets",      subtitle: "garment", content: "180", displayOrder: 9 },
            { title: "Sweaters",     subtitle: "garment", content: "100", displayOrder: 10 },
            { title: "Blankets",     subtitle: "garment", content: "250", displayOrder: 11 },
            { title: "Bedsheets",    subtitle: "garment", content: "80",  displayOrder: 12 },
            { title: "Curtains",     subtitle: "garment", content: "150", displayOrder: 13 },
            { title: "Carpets",      subtitle: "garment", content: "500", displayOrder: 14 },
            { title: "Sofa Covers",  subtitle: "garment", content: "300", displayOrder: 15 },
            { title: "Pillows",      subtitle: "garment", content: "60",  displayOrder: 16 },
            { title: "Shoes",        subtitle: "garment", content: "350", displayOrder: 17 },
            // --- Services (subtitle: "service", content: addOn price) ---
            { title: "Wash Only",      subtitle: "service", content: "0",   displayOrder: 1 },
            { title: "Wash & Fold",    subtitle: "service", content: "10",  displayOrder: 2 },
            { title: "Wash & Iron",    subtitle: "service", content: "25",  displayOrder: 3 },
            { title: "Dry Cleaning",   subtitle: "service", content: "100", displayOrder: 4 },
            { title: "Steam Iron",     subtitle: "service", content: "30",  displayOrder: 5 },
            { title: "Premium Care",   subtitle: "service", content: "80",  displayOrder: 6 },
            { title: "Stain Removal",  subtitle: "service", content: "50",  displayOrder: 7 },
            { title: "Delicate Care",  subtitle: "service", content: "60",  displayOrder: 8 },
            // --- Turnarounds (subtitle: "turnaround", content: multiplier) ---
            { title: "Standard (48 hrs)", subtitle: "turnaround", content: "1",   displayOrder: 1 },
            { title: "Express (24 hrs)",  subtitle: "turnaround", content: "1.5", displayOrder: 2 },
            { title: "Same Day (12 hrs)", subtitle: "turnaround", content: "2",   displayOrder: 3 },
            // --- Add-ons (subtitle: "addon", content: price) ---
            { title: "Shirt",                    subtitle: "addon", content: "45",  displayOrder: 1 },
            { title: "Trousers",                 subtitle: "addon", content: "40",  displayOrder: 2 },
            { title: "Suit (2-piece)",           subtitle: "addon", content: "80",  displayOrder: 3 },
            { title: "Dress",                    subtitle: "addon", content: "40",  displayOrder: 4 },
            { title: "Coat",                     subtitle: "addon", content: "100", displayOrder: 5 },
            { title: "King Bedsheet",            subtitle: "addon", content: "100", displayOrder: 6 },
            { title: "Duvet Cover",              subtitle: "addon", content: "70",  displayOrder: 7 },
            { title: "Towel",                    subtitle: "addon", content: "60",  displayOrder: 8 },
            { title: "Stain Removal",            subtitle: "addon", content: "45",  displayOrder: 9 },
            { title: "Express Pressing",         subtitle: "addon", content: "40",  displayOrder: 10 },
            { title: "Fabric Softener Upgrade",  subtitle: "addon", content: "80",  displayOrder: 11 },
            { title: "Hanger Return",            subtitle: "addon", content: "40",  displayOrder: 12 },
            { title: "Premium Packaging",        subtitle: "addon", content: "100", displayOrder: 13 },
            { title: "Scent Selection",          subtitle: "addon", content: "100", displayOrder: 14 },
            { title: "Hypoallergenic Detergent", subtitle: "addon", content: "70",  displayOrder: 15 },
            { title: "Re-Fold Service",          subtitle: "addon", content: "60",  displayOrder: 16 },
          ]
        }
      ]
    },
    // Coverage Page
    {
      slug: "coverage",
      title: "Coverage Area",
      description: "Find out if LAUNDRIX is available in your area.",
      sections: [
        {
          key: "hero",
          title: "Service Coverage Areas",
          subtitle: "Coverage",
          content: "LAUNDRIX currently operates across major cities and surrounding areas.",
          order: 1,
          items: []
        },
        {
          key: "cities",
          title: "Coverage by Area",
          subtitle: "LAUNDRIX currently operates across these major cities.",
          order: 2,
          items: [
            { title: "Dhaka", subtitle: "Available" },
            { title: "Chittagong", subtitle: "Available" },
            { title: "Sylhet", subtitle: "Available" },
            { title: "Rajshahi", subtitle: "Available" },
            { title: "Khulna", subtitle: "Available" },
            { title: "Rangpur", subtitle: "Available" },
            { title: "Barisal", subtitle: "Available" },
            { title: "Comilla", subtitle: "Available" },
            { title: "Mymensingh", subtitle: "Available" },
            { title: "Narayanganj", subtitle: "Available" },
          ]
        }
      ]
    },
    // Branches Page
    {
      slug: "branches",
      title: "Our Branches",
      description: "Find a LAUNDRIX branch near you.",
      sections: [
        {
          key: "hero",
          title: "Find a Branch Near You",
          subtitle: "Locations",
          content: "Visit any of our physical locations for drop-offs or consultations.",
          order: 1,
          items: []
        }
      ]
    },
    // Corporate Page
    {
      slug: "corporate",
      title: "Corporate Solutions",
      description: "Enterprise laundry solutions.",
      sections: [
        {
          key: "hero",
          title: "Enterprise Solutions for Your Business",
          subtitle: "Corporate Services",
          content: "Dedicated solutions for hotels, restaurants, healthcare, and large enterprises. Volume pricing, weekly invoicing, and a dedicated account team.",
          order: 1,
          items: []
        }
      ]
    },
    // Partner Page
    {
      slug: "partner",
      title: "Partner with Us",
      description: "Grow your business with LAUNDRIX.",
      sections: [
        {
          key: "hero",
          title: "Grow your business with LAUNDRIX",
          subtitle: "Partnership",
          content: "Join our partner network and access thousands of orders, powerful dashboard tools, and reliable weekly payouts.",
          order: 1,
          items: []
        }
      ]
    }
  ];

  for (const pageData of pagesData) {
    const page = await prisma.cmsPage.upsert({
      where: { slug: pageData.slug },
      update: {
        title: pageData.title,
        description: pageData.description,
      },
      create: {
        slug: pageData.slug,
        title: pageData.title,
        description: pageData.description,
        status: "PUBLISHED",
      },
    });

    for (const sectionData of pageData.sections) {
      const section = await prisma.cmsSection.upsert({
        where: { pageId_sectionKey: { pageId: page.id, sectionKey: sectionData.key } },
        update: {
          title: sectionData.title,
          subtitle: sectionData.subtitle,
          content: (sectionData as any).content || null,
        },
        create: {
          pageId: page.id,
          sectionKey: sectionData.key,
          title: sectionData.title,
          subtitle: sectionData.subtitle,
          content: (sectionData as any).content || null,
          displayOrder: sectionData.order,
        },
      });

      for (let i = 0; i < sectionData.items.length; i++) {
        const item: any = sectionData.items[i];
        const existing = await prisma.cmsContentItem.findFirst({
          where: {
            sectionId: section.id,
            title: item.title,
            // Also match subtitle so same-name items in different categories are treated separately
            subtitle: item.subtitle ?? null,
          },
        });
        if (!existing) {
          await prisma.cmsContentItem.create({
            data: {
              sectionId: section.id,
              title: item.title,
              subtitle: item.subtitle,
              content: item.content,
              icon: item.icon,
              image: item.image,
              displayOrder: item.displayOrder ?? i + 1,
            },
          });
        } else {
          await prisma.cmsContentItem.update({
            where: { id: existing.id },
            data: {
              subtitle: item.subtitle,
              content: item.content,
              icon: item.icon,
              image: item.image,
              displayOrder: item.displayOrder ?? i + 1,
            }
          });
        }
      }
    }
  }

  console.log("CMS Data Seeding Completed!");
}
