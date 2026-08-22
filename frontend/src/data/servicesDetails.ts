import {
  Shirt,
  Sparkles,
  ZapIcon,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
// console.log("THIS IS THE FILE I'M EDITING");
// export const serviceDetails = {
//   "wash-fold": {
//     id: "wash-fold",
//     title: "Wash & Fold",
//     icon: Shirt,
//     isPremium: false,
//     description: "Everyday laundry washed, dried, and neatly folded. Perfect for your daily wear, bed sheets, and towels. Priced by weight for ultimate convenience.",
//     startingPrice: "৳80/kg",
//     turnaround: "24 hours",
//     coverage: "All Branches",
//     imageUrl: "/images/home/service/servie1.png",
//     includes: [
//       "T-Shirts & Polos",
//       "Jeans & Casual Pants",
//       "Undergarments",
//       "Socks",
//       "Towels",
//       "Bedsheets",
//       "Pillowcases",
//       "Pajamas"
//     ],
//     process: [
//       { step: 1, title: "Sorting", description: "Lights and darks are separated to prevent color bleeding." },
//       { step: 2, title: "Washing", description: "Washed with premium detergents at the optimal temperature." },
//       { step: 3, title: "Drying", description: "Tumble dried at low heat to protect fibers and prevent shrinkage." },
//       { step: 4, title: "Folding", description: "Neatly folded and packed in protective bags for delivery." }
//     ],
//     faqs: [
//       { question: "Is there a minimum weight?", answer: "Yes, our minimum order weight for Wash & Fold is 3 kg." },
//       { question: "Do you iron the clothes?", answer: "No, this service only includes washing, drying, and folding. For ironing, select our Wash & Iron service." }
//     ]
//   },
//   "wash-iron": {
//     id: "wash-iron",
//     title: "Wash & Iron",
//     icon:RefreshCw,
//     isPremium: true,
//     description: "High-capacity, industrial laundry services for hotels, hospitals, restaurants, and corporate clients with custom SLAs.",
//     startingPrice: "৳45/kg",
//     turnaround: "24-48 hours",
//     coverage: "All Major Cities",
//     imageUrl:"/images/home/service/servie4.png",
//     includes: ["Linens & Bedding", "Uniforms & Aprons", "Towels & Napkins", "Bulk Garments"],
//     process: [
//       { step: 1, title: "Bulk Pickup", description: "Scheduled logistics pickup from your facility." },
//       { step: 2, title: "Industrial Wash", description: "High-temp thermal disinfection and heavy-duty washing." },
//       { step: 3, title: "Batch Delivery", description: "Packed in sanitized hampers and delivered on time." }
//     ],
//     faqs: [
//       { question: "Do you offer contract pricing?", answer: "Yes, we offer tailored monthly contracts and volume discounts for commercial partners." }
//     ]
//   },
//   "dry-cleaning": {
//     id: "dry-cleaning",
//     title: "Dry Cleaning",
//     icon: Sparkles,
//     isPremium: true,
//     description: "Professional solvent cleaning for delicate, formal, and specialty garments. We restore original lustre and protect fabric integrity using Hydrocarbon solvents approved for all textile types.",
//     startingPrice: "৳100/item",
//     turnaround: "48 hours",
//     coverage: "All Branches",
//     imageUrl: "/images/home/service/servie2.png",
//     includes: [
//       "Suits & Blazers",
//       "Dresses & Gowns",
//       "Wool & Cashmere",
//       "Silk & Satin",
//       "Leather & Suede",
//       "Coats & Jackets",
//       "Ties & Scarves",
//       "Wedding Attire",
//       "Designer Pieces",
//       "Uniforms",
//       "Curtains & Drapes",
//       "Formalwear"
//     ],
//     process: [
//       {
//         step: 1,
//         title: "Inspection",
//         description: "We examine every garment for stains, damage, and care label requirements before any treatment begins."
//       },
//       {
//         step: 2,
//         title: "Pre-Treatment",
//         description: "Stains and soiled areas receive targeted pre-treatment using fabric-safe specialist solutions."
//       },
//       {
//         step: 3,
//         title: "Dry Cleaning",
//         description: "Professional cleaning using premium Hydrocarbon solvents — safe for all fabrics, zero residue."
//       },
//       {
//         step: 4,
//         title: "Finishing",
//         description: "Steam pressing and meticulous hand finishing to restore the original shape and appearance of each piece."
//       }
//     ],
//     faqs: [
//       {
//         question: "How does pickup and delivery work?",
//         answer: "You can schedule a pickup through our website or app. Our agent will collect your items, and we'll deliver them back to your door within 48 hours."
//       },
//       {
//         question: "How does QR tracking work?",
//         answer: "Every garment is tagged with a unique QR code upon pickup. You can scan it or track it in your dashboard to see exactly where your items are in the cleaning process."
//       },
//       {
//         question: "Which cities do you currently serve?",
//         answer: "We currently serve all major metropolitan areas in Bangladesh, including Dhaka, Chattogram, and Sylhet."
//       },
//       {
//         question: "What is your pricing structure?",
//         answer: "Pricing is per-item for dry cleaning. You can check exact prices on our Pricing page or use our live calculator before booking."
//       }
//     ]
//   },
//   "ironing-press": {
//     id: "ironing-press",
//     title: "Ironing & Pressing",
//     icon: RefreshCw,
//     isPremium: false,
//     description: "Complete care for your everyday clothes. Crisp, clean, and perfectly ironed so you are always ready to go.",
//     startingPrice: "৳40/item",
//     turnaround: "48 hours",
//     coverage: "All Branches",
//     imageUrl: "/images/home/service/servie3.png",
//     includes: [
//       "Formal Shirts",
//       "Formal Pants",
//       "Punjabis",
//       "Sarees (Cotton)",
//       "Kurtis",
//       "School Uniforms"
//     ],
//     process: [
//       { step: 1, title: "Sorting", description: "Careful separation based on fabric type and color." },
//       { step: 2, title: "Washing", description: "Gentle wash cycle to remove dirt and odors." },
//       { step: 3, title: "Ironing", description: "Professional steam ironing for a crisp finish." },
//       { step: 4, title: "Packing", description: "Delivered on hangers or neatly folded according to your preference." }
//     ],
//     faqs: [
//       { question: "Can I get my clothes on hangers?", answer: "Yes, you can request hanger delivery during checkout for a small additional fee." }
//     ]
//   },
  
//   "stain-removal": {
//     id: "stain-removal",
//     title: "Stain Removal",
//     icon:Shield,
//     isPremium: true,
//     description: "Advanced spot treatment for stubborn stains such as oil, ink, wine, and grease without harming fabric integrity.",
//     startingPrice: "৳100/item",
//     turnaround: "24-48 hours",
//     coverage: "All Branches",
//     imageUrl:"/images/home/service/servie5.png",
//     includes: ["Oil Stains", "Ink & Dyes", "Food & Wine", "Grease & Dirt", "Delicate Fabrics"],
//     process: [
//       { step: 1, title: "Analysis", description: "Identifying stain type and fabric sensitivity." },
//       { step: 2, title: "Targeted Spotting", description: "Applying specialized chemical spotting agents." },
//       { step: 3, title: "Deep Wash", description: "Neutralizing wash to safely remove all residues." }
//     ],
//     faqs: [
//       { question: "Can all stains be removed?", answer: "While we achieve a 95%+ success rate, some old or heat-set stains may be permanent. We perform a thorough test first." }
//     ]
//   },
//   "express-laundry": {
//     id: "express-laundry",
//     title: "Express Laundry",
//     icon:Zap,
//     isPremium: true,
//     description: "Ultra-fast wash, dry, and iron turnaround for urgent travel, events, or busy schedules within 6 to 12 hours.",
//     startingPrice: "৳80/kg",
//     turnaround: "6-12 hours",
//     coverage: "Dhaka & Major Hubs",
//     imageUrl:"/images/home/service/servie6.jpg",
//     includes: ["Express Wash & Fold", "Express Pressing", "Emergency Pickup"],
//     process: [
//       { step: 1, title: "Priority Pickup", description: "Rider dispatched within 30 minutes of booking." },
//       { step: 2, title: "Express Cycle", description: "Dedicated machine cycle with rapid low-heat drying." },
//       { step: 3, title: "Same-Day Delivery", description: "Handed back to you on the same day." }
//     ],
//     faqs: [
//       { question: "What is the cutoff time for same-day delivery?", answer: "Bookings placed before 11:00 AM are eligible for 6-12 hour express same-day delivery." }
//     ]
//   }
// };

export const serviceDetails = {
  "wash-only": {
    id: "wash-only",
    title: "Wash Only",
    icon: Shirt,
    isPremium: false,
    description:
      "A simple and reliable washing service for everyday garments. Clothes are carefully sorted, washed with quality detergents, and prepared for collection or further care.",
    startingPrice: "Free",
    turnaround: "24 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-1.png",

    includes: [
      "T-Shirts & Polos",
      "Casual Shirts",
      "Jeans & Pants",
      "Undergarments",
      "Socks",
      "Towels",
      "Bedsheets",
    ],

    process: [
      {
        step: 1,
        title: "Sorting",
        description:
          "Garments are sorted carefully by color, fabric type, and washing requirements.",
      },
      {
        step: 2,
        title: "Washing",
        description:
          "Clothes are washed using quality detergents and suitable wash cycles.",
      },
      {
        step: 3,
        title: "Quality Check",
        description:
          "Each batch is checked to ensure the garments are properly cleaned before handover.",
      },
      {
        step: 4,
        title: "Ready for Collection",
        description:
          "Clean garments are organized and prepared for collection or additional services.",
      },
    ],

    faqs: [
      {
        question: "Does Wash Only include ironing?",
        answer:
          "No. Wash Only includes washing and basic preparation only. You can select ironing or other care services separately.",
      },
      {
        question: "What types of clothes can I submit?",
        answer:
          "Wash Only is suitable for most everyday washable garments such as T-shirts, shirts, jeans, towels, and bedsheets.",
      },
    ],
  },

  "wash-fold": {
    id: "wash-fold",
    title: "Wash & Fold",
    icon: Shirt,
    isPremium: false,
    description:
      "Everyday laundry washed, dried, and neatly folded. Perfect for daily wear, towels, bedsheets, and other washable garments.",
    startingPrice: "৳80/kg",
    turnaround: "24 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-2.png",

    includes: [
      "T-Shirts & Polos",
      "Jeans & Casual Pants",
      "Undergarments",
      "Socks",
      "Towels",
      "Bedsheets",
      "Pillowcases",
      "Pajamas",
    ],

    process: [
      {
        step: 1,
        title: "Sorting",
        description:
          "Lights, darks, and different fabric types are separated to protect your garments.",
      },
      {
        step: 2,
        title: "Washing",
        description:
          "Garments are washed using quality detergents and appropriate washing cycles.",
      },
      {
        step: 3,
        title: "Drying",
        description:
          "Clothes are carefully dried using suitable temperature settings to protect fabric fibers.",
      },
      {
        step: 4,
        title: "Folding",
        description:
          "Clean and dry garments are neatly folded and packed for convenient delivery.",
      },
    ],

    faqs: [
      {
        question: "Is there a minimum weight?",
        answer:
          "Yes, our minimum order weight for Wash & Fold is 3 kg.",
      },
      {
        question: "Do you iron the clothes?",
        answer:
          "No. Wash & Fold includes washing, drying, and folding. For ironing, choose Wash & Iron or Steam Iron.",
      },
    ],
  },

  "wash-iron": {
    id: "wash-iron",
    title: "Wash & Iron",
    icon: RefreshCw,
    isPremium: false,
    description:
      "A complete everyday garment care service combining professional washing with crisp ironing for clean, fresh, and ready-to-wear clothes.",
    startingPrice: "৳105/kg",
    turnaround: "24-48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-3.png",

    includes: [
      "Formal Shirts",
      "T-Shirts & Polos",
      "Formal Pants",
      "Casual Pants",
      "School Uniforms",
      "Punjabis",
      "Cotton Dresses",
      "Everyday Wear",
    ],

    process: [
      {
        step: 1,
        title: "Sorting",
        description:
          "Garments are sorted according to color, fabric, and care requirements.",
      },
      {
        step: 2,
        title: "Washing",
        description:
          "Each garment is cleaned using suitable detergents and fabric-safe washing cycles.",
      },
      {
        step: 3,
        title: "Drying",
        description:
          "Clothes are dried carefully using appropriate temperature settings.",
      },
      {
        step: 4,
        title: "Ironing",
        description:
          "Garments are professionally ironed to achieve a smooth and crisp finish.",
      },
    ],

    faqs: [
      {
        question: "Does Wash & Iron include folding?",
        answer:
          "Garments are properly prepared after ironing and packed safely for delivery.",
      },
      {
        question: "Is it suitable for formal clothes?",
        answer:
          "Yes. Shirts, trousers, uniforms, and other everyday formal garments are suitable for this service.",
      },
    ],
  },

  "dry-cleaning": {
    id: "dry-cleaning",
    title: "Dry Cleaning",
    icon: Sparkles,
    isPremium: true,
    description:
      "Professional solvent-based cleaning for delicate, formal, and specialty garments. Designed to remove difficult dirt and stains while protecting fabric quality and appearance.",
    startingPrice: "৳100/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-4.jpg",

    includes: [
      "Suits & Blazers",
      "Dresses & Gowns",
      "Wool & Cashmere",
      "Silk & Satin",
      "Coats & Jackets",
      "Ties & Scarves",
      "Wedding Attire",
      "Designer Pieces",
      "Formalwear",
    ],

    process: [
      {
        step: 1,
        title: "Inspection",
        description:
          "Every garment is inspected for stains, damage, fabric type, and care-label requirements.",
      },
      {
        step: 2,
        title: "Pre-Treatment",
        description:
          "Visible stains and heavily soiled areas receive targeted fabric-safe treatment.",
      },
      {
        step: 3,
        title: "Dry Cleaning",
        description:
          "Garments are professionally cleaned using suitable dry-cleaning solvents.",
      },
      {
        step: 4,
        title: "Finishing",
        description:
          "Steam pressing and detailed finishing restore the garment's shape and appearance.",
      },
    ],

    faqs: [
      {
        question: "Which garments need dry cleaning?",
        answer:
          "Suits, blazers, gowns, wool, silk, formalwear, and other garments with special care requirements are commonly suitable for dry cleaning.",
      },
      {
        question: "How long does dry cleaning take?",
        answer:
          "Our standard dry-cleaning turnaround is approximately 48 hours.",
      },
      {
        question: "Can you remove difficult stains?",
        answer:
          "We use professional pre-treatment techniques to handle many common stains, although results may vary depending on the stain and fabric.",
      },
    ],
  },

  "steam-iron": {
    id: "steam-iron",
    title: "Steam Iron",
    icon: RefreshCw,
    isPremium: false,
    description:
      "Professional steam ironing that removes wrinkles and gives your garments a smooth, crisp, and polished appearance without washing them.",
    startingPrice: "৳30/item",
    turnaround: "24 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-5.png",

    includes: [
      "Formal Shirts",
      "Formal Pants",
      "T-Shirts",
      "Punjabis",
      "Cotton Sarees",
      "Kurtis",
      "School Uniforms",
      "Everyday Garments",
    ],

    process: [
      {
        step: 1,
        title: "Inspection",
        description:
          "Garments are checked for fabric type, wrinkles, and special ironing requirements.",
      },
      {
        step: 2,
        title: "Steam Treatment",
        description:
          "Controlled steam is applied to relax fabric fibers and remove wrinkles.",
      },
      {
        step: 3,
        title: "Professional Pressing",
        description:
          "Each garment is carefully pressed according to its fabric and structure.",
      },
      {
        step: 4,
        title: "Final Check",
        description:
          "Garments are inspected for a clean, smooth, and crisp finish before packing.",
      },
    ],

    faqs: [
      {
        question: "Does Steam Iron include washing?",
        answer:
          "No. Steam Iron is a pressing-only service. Your garments are not washed as part of this service.",
      },
      {
        question: "Can delicate garments be steam ironed?",
        answer:
          "Yes, when the fabric and care label allow steam treatment. Special fabrics may require Delicate Care instead.",
      },
    ],
  },

  "premium-care": {
    id: "premium-care",
    title: "Premium Care",
    icon: Sparkles,
    isPremium: true,
    description:
      "Enhanced garment care for valuable, premium, and special-occasion clothing. Every item receives additional attention from inspection through final finishing.",
    startingPrice: "৳80/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-6.png",

    includes: [
      "Designer Wear",
      "Premium Suits",
      "Party Dresses",
      "Bridal & Occasion Wear",
      "Premium Shirts",
      "Luxury Fabrics",
      "Embroidered Garments",
      "Special Occasion Clothing",
    ],

    process: [
      {
        step: 1,
        title: "Detailed Inspection",
        description:
          "Every garment is carefully inspected for fabric condition, stains, embellishments, and care requirements.",
      },
      {
        step: 2,
        title: "Special Treatment",
        description:
          "The appropriate cleaning and treatment method is selected based on the garment's material and condition.",
      },
      {
        step: 3,
        title: "Careful Cleaning",
        description:
          "Garments receive a controlled cleaning process designed to preserve their quality and appearance.",
      },
      {
        step: 4,
        title: "Premium Finishing",
        description:
          "Final steaming, pressing, inspection, and protective packaging complete the premium care process.",
      },
    ],

    faqs: [
      {
        question: "What makes Premium Care different?",
        answer:
          "Premium Care provides additional inspection, handling, finishing, and packaging for garments that require extra attention.",
      },
      {
        question: "Which garments are suitable for Premium Care?",
        answer:
          "Designer clothing, embroidered garments, occasion wear, premium suits, and other valuable pieces are suitable for this service.",
      },
    ],
  },

  "stain-removal": {
    id: "stain-removal",
    title: "Stain Removal",
    icon: Shield,
    isPremium: true,
    description:
      "Specialized spot treatment for stubborn stains such as oil, ink, food, wine, grease, and dirt while carefully protecting the garment's fabric.",
    startingPrice: "৳50/item",
    turnaround: "24-48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-7.png",

    includes: [
      "Oil Stains",
      "Ink & Dyes",
      "Food Stains",
      "Wine Stains",
      "Grease & Dirt",
      "Makeup Stains",
      "Sweat Stains",
      "Delicate Fabrics",
    ],

    process: [
      {
        step: 1,
        title: "Stain Analysis",
        description:
          "Our team identifies the stain type, age, and fabric sensitivity before treatment.",
      },
      {
        step: 2,
        title: "Spot Treatment",
        description:
          "Specialized spotting solutions are carefully applied to the affected area.",
      },
      {
        step: 3,
        title: "Deep Cleaning",
        description:
          "The garment undergoes the appropriate cleaning process to remove remaining stain residue.",
      },
      {
        step: 4,
        title: "Final Inspection",
        description:
          "The treated area is inspected to ensure the best possible result without damaging the fabric.",
      },
    ],

    faqs: [
      {
        question: "Can every stain be removed?",
        answer:
          "Not every stain can be completely removed. Results depend on the stain type, fabric, age of the stain, and whether it has previously been treated.",
      },
      {
        question: "Will stain removal damage my clothes?",
        answer:
          "We select treatment methods based on fabric sensitivity and always prioritize protecting the garment.",
      },
    ],
  },

  "delicate-care": {
    id: "delicate-care",
    title: "Delicate Care",
    icon: Shield,
    isPremium: true,
    description:
      "Gentle, specialized care for delicate fabrics and garments that require extra attention. Each item is handled carefully to preserve its shape, texture, color, and finish.",
    startingPrice: "৳60/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "/images/home/service/service-8.png",

    includes: [
      "Silk & Satin",
      "Chiffon",
      "Lace Garments",
      "Embroidered Clothing",
      "Wool & Cashmere",
      "Designer Wear",
      "Delicate Dresses",
      "Special Occasion Wear",
    ],

    process: [
      {
        step: 1,
        title: "Fabric Inspection",
        description:
          "The garment is inspected carefully to identify fabric type, embellishments, color, and care requirements.",
      },
      {
        step: 2,
        title: "Gentle Treatment",
        description:
          "A suitable low-impact cleaning method is selected to minimize stress on delicate fibers.",
      },
      {
        step: 3,
        title: "Careful Drying",
        description:
          "Garments are dried using controlled conditions to help maintain their original shape and texture.",
      },
      {
        step: 4,
        title: "Hand Finishing",
        description:
          "Final finishing and packaging are performed carefully to preserve the garment's appearance.",
      },
    ],

    faqs: [
      {
        question: "Which garments should use Delicate Care?",
        answer:
          "Silk, chiffon, lace, embroidered clothing, wool, cashmere, designer wear, and other sensitive garments are ideal for Delicate Care.",
      },
      {
        question: "Can I use Delicate Care for expensive clothes?",
        answer:
          "Yes. Delicate Care is specifically designed for garments that require more careful handling than standard laundry services.",
      },
    ],
  },
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

