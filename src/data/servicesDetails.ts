import {
  Shirt,
  Sparkles,
  ZapIcon,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
// console.log("THIS IS THE FILE I'M EDITING");
export const serviceDetails = {
  "wash-fold": {
    id: "wash-fold",
    title: "Wash & Fold",
    icon: Shirt,
    isPremium: false,
    description: "Everyday laundry washed, dried, and neatly folded. Perfect for your daily wear, bed sheets, and towels. Priced by weight for ultimate convenience.",
    startingPrice: "৳80/kg",
    turnaround: "24 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/servie1.png",
    includes: [
      "T-Shirts & Polos",
      "Jeans & Casual Pants",
      "Undergarments",
      "Socks",
      "Towels",
      "Bedsheets",
      "Pillowcases",
      "Pajamas"
    ],
    process: [
      { step: 1, title: "Sorting", description: "Lights and darks are separated to prevent color bleeding." },
      { step: 2, title: "Washing", description: "Washed with premium detergents at the optimal temperature." },
      { step: 3, title: "Drying", description: "Tumble dried at low heat to protect fibers and prevent shrinkage." },
      { step: 4, title: "Folding", description: "Neatly folded and packed in protective bags for delivery." }
    ],
    faqs: [
      { question: "Is there a minimum weight?", answer: "Yes, our minimum order weight for Wash & Fold is 3 kg." },
      { question: "Do you iron the clothes?", answer: "No, this service only includes washing, drying, and folding. For ironing, select our Wash & Iron service." }
    ]
  },
  "dry-cleaning": {
    id: "dry-cleaning",
    title: "Dry Cleaning",
    icon: Sparkles,
    isPremium: true,
    description: "Professional solvent cleaning for delicate, formal, and specialty garments. We restore original lustre and protect fabric integrity using Hydrocarbon solvents approved for all textile types.",
    startingPrice: "৳100/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/servie2.png",
    includes: [
      "Suits & Blazers",
      "Dresses & Gowns",
      "Wool & Cashmere",
      "Silk & Satin",
      "Leather & Suede",
      "Coats & Jackets",
      "Ties & Scarves",
      "Wedding Attire",
      "Designer Pieces",
      "Uniforms",
      "Curtains & Drapes",
      "Formalwear"
    ],
    process: [
      {
        step: 1,
        title: "Inspection",
        description: "We examine every garment for stains, damage, and care label requirements before any treatment begins."
      },
      {
        step: 2,
        title: "Pre-Treatment",
        description: "Stains and soiled areas receive targeted pre-treatment using fabric-safe specialist solutions."
      },
      {
        step: 3,
        title: "Dry Cleaning",
        description: "Professional cleaning using premium Hydrocarbon solvents — safe for all fabrics, zero residue."
      },
      {
        step: 4,
        title: "Finishing",
        description: "Steam pressing and meticulous hand finishing to restore the original shape and appearance of each piece."
      }
    ],
    faqs: [
      {
        question: "How does pickup and delivery work?",
        answer: "You can schedule a pickup through our website or app. Our agent will collect your items, and we'll deliver them back to your door within 48 hours."
      },
      {
        question: "How does QR tracking work?",
        answer: "Every garment is tagged with a unique QR code upon pickup. You can scan it or track it in your dashboard to see exactly where your items are in the cleaning process."
      },
      {
        question: "Which cities do you currently serve?",
        answer: "We currently serve all major metropolitan areas in Bangladesh, including Dhaka, Chattogram, and Sylhet."
      },
      {
        question: "What is your pricing structure?",
        answer: "Pricing is per-item for dry cleaning. You can check exact prices on our Pricing page or use our live calculator before booking."
      }
    ]
  },
  "ironing-press": {
    id: "ironing-press",
    title: "Ironing & Pressing",
    icon: RefreshCw,
    isPremium: false,
    description: "Complete care for your everyday clothes. Crisp, clean, and perfectly ironed so you are always ready to go.",
    startingPrice: "৳40/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/servie3.png",
    includes: [
      "Formal Shirts",
      "Formal Pants",
      "Punjabis",
      "Sarees (Cotton)",
      "Kurtis",
      "School Uniforms"
    ],
    process: [
      { step: 1, title: "Sorting", description: "Careful separation based on fabric type and color." },
      { step: 2, title: "Washing", description: "Gentle wash cycle to remove dirt and odors." },
      { step: 3, title: "Ironing", description: "Professional steam ironing for a crisp finish." },
      { step: 4, title: "Packing", description: "Delivered on hangers or neatly folded according to your preference." }
    ],
    faqs: [
      { question: "Can I get my clothes on hangers?", answer: "Yes, you can request hanger delivery during checkout for a small additional fee." }
    ]
  },
  "wash-iron": {
    id: "wash-iron",
    title: "Wash & Iron",
    icon:RefreshCw,
    isPremium: true,
    description: "High-capacity, industrial laundry services for hotels, hospitals, restaurants, and corporate clients with custom SLAs.",
    startingPrice: "৳45/kg",
    turnaround: "24-48 hours",
    coverage: "All Major Cities",
    imageUrl:"/images/home/service/servie4.png",
    includes: ["Linens & Bedding", "Uniforms & Aprons", "Towels & Napkins", "Bulk Garments"],
    process: [
      { step: 1, title: "Bulk Pickup", description: "Scheduled logistics pickup from your facility." },
      { step: 2, title: "Industrial Wash", description: "High-temp thermal disinfection and heavy-duty washing." },
      { step: 3, title: "Batch Delivery", description: "Packed in sanitized hampers and delivered on time." }
    ],
    faqs: [
      { question: "Do you offer contract pricing?", answer: "Yes, we offer tailored monthly contracts and volume discounts for commercial partners." }
    ]
  },
  "stain-removal": {
    id: "stain-removal",
    title: "Stain Removal",
    icon:Shield,
    isPremium: true,
    description: "Advanced spot treatment for stubborn stains such as oil, ink, wine, and grease without harming fabric integrity.",
    startingPrice: "৳100/item",
    turnaround: "24-48 hours",
    coverage: "All Branches",
    imageUrl:"/images/home/service/servie5.png",
    includes: ["Oil Stains", "Ink & Dyes", "Food & Wine", "Grease & Dirt", "Delicate Fabrics"],
    process: [
      { step: 1, title: "Analysis", description: "Identifying stain type and fabric sensitivity." },
      { step: 2, title: "Targeted Spotting", description: "Applying specialized chemical spotting agents." },
      { step: 3, title: "Deep Wash", description: "Neutralizing wash to safely remove all residues." }
    ],
    faqs: [
      { question: "Can all stains be removed?", answer: "While we achieve a 95%+ success rate, some old or heat-set stains may be permanent. We perform a thorough test first." }
    ]
  },
  "express-laundry": {
    id: "express-laundry",
    title: "Express Laundry",
    icon:Zap,
    isPremium: true,
    description: "Ultra-fast wash, dry, and iron turnaround for urgent travel, events, or busy schedules within 6 to 12 hours.",
    startingPrice: "৳80/kg",
    turnaround: "6-12 hours",
    coverage: "Dhaka & Major Hubs",
    imageUrl:"/images/home/service/servie6.jpg",
    includes: ["Express Wash & Fold", "Express Pressing", "Emergency Pickup"],
    process: [
      { step: 1, title: "Priority Pickup", description: "Rider dispatched within 30 minutes of booking." },
      { step: 2, title: "Express Cycle", description: "Dedicated machine cycle with rapid low-heat drying." },
      { step: 3, title: "Same-Day Delivery", description: "Handed back to you on the same day." }
    ],
    faqs: [
      { question: "What is the cutoff time for same-day delivery?", answer: "Bookings placed before 11:00 AM are eligible for 6-12 hour express same-day delivery." }
    ]
  }
};

export function getServiceDetails(slug: string) {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase();
  
  if (serviceDetails[normalizedSlug as keyof typeof serviceDetails]) {
    return serviceDetails[normalizedSlug as keyof typeof serviceDetails];
  }

  // Dynamic fallback for custom slugs or DB IDs
  const formattedTitle = normalizedSlug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: slug,
    title: formattedTitle || "Laundry Service",
    isPremium: false,
    description: "Professional cleaning, garment care, and pressing tailored to your daily laundry needs.",
    startingPrice: "৳50/item",
    turnaround: "24-48 hours",
    coverage: "All Branches",
    imageUrl: "https://images.unsplash.com/photo-1582735689141-c11bb356c6d5?q=80&w=2070&auto=format&fit=crop",
    includes: ["General Garments", "Shirts & Pants", "Household Linen", "Gentle Wash"],
    process: [
      { step: 1, title: "Inspection & Sorting", description: "Carefully checking care labels and fabrics." },
      { step: 2, title: "Quality Wash", description: "Washed with eco-safe detergents at optimal heat." },
      { step: 3, title: "Finishing & Delivery", description: "Neatly pressed or folded and delivered to your doorstep." }
    ],
    faqs: [
      { question: "How can I book this service?", answer: "Click 'Book Service' or schedule a pickup directly through our web portal or mobile app." }
    ]
  };
}

