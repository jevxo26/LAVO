/**
 * Seed Homepage Services
 * Run with: npx ts-node -r tsconfig-paths/register server/scripts/seed-homepage-services.ts
 *
 * This script ensures that all services displayed on the public homepage
 * also exist in the database so they appear in the customer's Book Laundry dashboard.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── Mirrors the public homepage service catalogue ──────────────────────────────
const HOMEPAGE_SERVICES = [
  // ── Clothing ──
  {
    garmentCategory: "Clothing",
    garmentType: "General Clothing",
    unit: "Piece",
    serviceCategory: "Wash & Fold",
    services: [
      {
        name: "Wash & Fold",
        price: 80,
        estimatedTime: "24 Hours",
        description:
          "Everyday laundry washed, dried, and neatly folded. Perfect for daily wear.",
      },
      {
        name: "Wash & Iron",
        price: 150,
        estimatedTime: "48 Hours",
        description:
          "Complete washing with professional steam ironing for a crisp finish.",
      },
      {
        name: "Ironing & Pressing",
        price: 40,
        estimatedTime: "48 Hours",
        description:
          "Crisp, wrinkle-free garments finished to a professional standard.",
      },
    ],
  },
  // ── Formal / Delicate ──
  {
    garmentCategory: "Formal & Delicate",
    garmentType: "Formal Wear",
    unit: "Piece",
    serviceCategory: "Dry Cleaning",
    services: [
      {
        name: "Dry Cleaning",
        price: 100,
        estimatedTime: "48 Hours",
        description:
          "Expert solvent cleaning for delicate, formal, and specialty garments.",
      },
      {
        name: "Premium Shirt Dry Clean",
        price: 150,
        estimatedTime: "48 Hours",
        description: "Thorough dry clean for premium shirts and formal tops.",
      },
    ],
  },
  // ── Stain & Special ──
  {
    garmentCategory: "Specialty",
    garmentType: "Specialty Items",
    unit: "Piece",
    serviceCategory: "Specialty Care",
    services: [
      {
        name: "Stain Removal",
        price: 100,
        estimatedTime: "24-48 Hours",
        description:
          "Advanced spot treatment for oil, ink, wine, and grease stains.",
      },
      {
        name: "Express Laundry",
        price: 80,
        estimatedTime: "6-12 Hours",
        description:
          "Ultra-fast wash, dry and iron turnaround for urgent needs.",
      },
    ],
  },
  // ── Household ──
  {
    garmentCategory: "Household",
    garmentType: "Home Linen",
    unit: "Piece",
    serviceCategory: "Household Laundry",
    services: [
      {
        name: "Bedsheet Wash",
        price: 120,
        estimatedTime: "48 Hours",
        description: "Professional wash and fold for bed sheets and pillow cases.",
      },
      {
        name: "Blanket Wash",
        price: 240,
        estimatedTime: "48 Hours",
        description: "Heavy-duty cleaning for blankets, quilts, and duvets.",
      },
      {
        name: "Curtain Wash",
        price: 180,
        estimatedTime: "48 Hours",
        description: "Gentle wash for curtains and drapes of all sizes.",
      },
    ],
  },
  // ── Suits & Blazers ──
  {
    garmentCategory: "Clothing",
    garmentType: "Men Tops",
    unit: "Piece",
    serviceCategory: "Wash & Fold",
    services: [
      {
        name: "Suit Dry Clean",
        price: 350,
        estimatedTime: "48 Hours",
        description: "Complete dry cleaning and pressing for full suits and blazers.",
      },
    ],
  },
  // ── Shoes ──
  {
    garmentCategory: "Specialty",
    garmentType: "Shoes",
    unit: "Pair",
    serviceCategory: "Specialty Care",
    services: [
      {
        name: "Premium Shoes Polish & Cleaning",
        price: 200,
        estimatedTime: "48 Hours",
        description: "Deep clean, deodorize, and polish for all types of shoes.",
      },
    ],
  },
];

const ADDONS = [
  { addonName: "Stain Removal", price: 50, description: "Remove tough stains" },
  { addonName: "Fabric Softener", price: 20, description: "Adds softness and fragrance" },
  { addonName: "Perfume Finish", price: 15, description: "Premium fresh scent" },
  { addonName: "Express Service", price: 100, description: "Delivery in 24 hours" },
  { addonName: "Hanger Return", price: 40, description: "Clothes returned on hangers" },
  { addonName: "Premium Packaging", price: 50, description: "Gift-ready packaging" },
];

async function main() {
  console.log("🌱 Starting homepage services seed...\n");

  for (const group of HOMEPAGE_SERVICES) {
    // 1. Garment Category
    let garmentCat = await prisma.garmentCategory.findUnique({
      where: { name: group.garmentCategory },
    });
    if (!garmentCat) {
      garmentCat = await prisma.garmentCategory.create({
        data: {
          name: group.garmentCategory,
          description: `${group.garmentCategory} laundry items`,
        },
      });
      console.log(`  ✅ Created garment category: ${group.garmentCategory}`);
    }

    // 2. Garment Type
    let garmentType = await prisma.garmentType.findFirst({
      where: { name: group.garmentType, categoryId: garmentCat.id },
    });
    if (!garmentType) {
      garmentType = await prisma.garmentType.create({
        data: {
          name: group.garmentType,
          categoryId: garmentCat.id,
          unitType: group.unit,
        },
      });
      console.log(`  ✅ Created garment type: ${group.garmentType}`);
    }

    // 3. Service Category
    let serviceCat = await prisma.serviceCategory.findUnique({
      where: { name: group.serviceCategory },
    });
    if (!serviceCat) {
      serviceCat = await prisma.serviceCategory.create({
        data: {
          name: group.serviceCategory,
          description: `${group.serviceCategory} services`,
        },
      });
      console.log(`  ✅ Created service category: ${group.serviceCategory}`);
    }

    // 4. Services
    for (const svc of group.services) {
      const existing = await prisma.service.findFirst({
        where: { serviceName: svc.name },
      });

      if (existing) {
        // Ensure it's ACTIVE
        if (existing.status !== "ACTIVE") {
          await prisma.service.update({
            where: { id: existing.id },
            data: { status: "ACTIVE" },
          });
          console.log(`  🔄 Re-activated: ${svc.name}`);
        } else {
          console.log(`  ⏭  Already exists: ${svc.name}`);
        }
        continue;
      }

      const created = await prisma.service.create({
        data: {
          serviceName: svc.name,
          description: svc.description,
          basePrice: svc.price,
          estimatedTime: svc.estimatedTime,
          serviceCategoryId: serviceCat.id,
          garmentTypeId: garmentType.id,
          status: "ACTIVE",
        },
      });

      // Add standard addons
      await prisma.serviceAddon.createMany({
        data: ADDONS.map((a) => ({
          serviceId: created.id,
          ...a,
          status: "ACTIVE",
        })),
        skipDuplicates: true,
      });

      console.log(`  🆕 Created service: ${svc.name} (৳${svc.price})`);
    }
  }

  const totalServices = await prisma.service.count({ where: { status: "ACTIVE" } });
  console.log(`\n✅ Done! Total active services in DB: ${totalServices}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
