export const serviceDetails = {
  "dry-cleaning": {
    id: "dry-cleaning",
    title: "Dry Cleaning",
    isPremium: true,
    description: "Professional solvent cleaning for delicate, formal, and specialty garments. We restore original lustre and protect fabric integrity using Hydrocarbon solvents approved for all textile types.",
    startingPrice: "৳100/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop",
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
  "wash-fold": {
    id: "wash-fold",
    title: "Wash & Fold",
    isPremium: false,
    description: "Everyday laundry washed, dried, and neatly folded. Perfect for your daily wear, bed sheets, and towels. Priced by weight for ultimate convenience.",
    startingPrice: "৳80/kg",
    turnaround: "24 hours",
    coverage: "All Branches",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=2070&auto=format&fit=crop",
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
  "wash-iron": {
    id: "wash-iron",
    title: "Wash & Iron",
    isPremium: false,
    description: "Complete care for your everyday clothes. Crisp, clean, and perfectly ironed so you are always ready to go.",
    startingPrice: "৳40/item",
    turnaround: "48 hours",
    coverage: "All Branches",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=2024&auto=format&fit=crop",
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
  }
};
