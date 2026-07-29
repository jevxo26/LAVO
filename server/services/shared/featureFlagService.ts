import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class FeatureFlagService {
  static async getAllFeatureFlags() {
    return await prisma.featureFlag.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async toggleFeatureFlag(id: string, isEnabled: boolean) {
    return await prisma.featureFlag.update({
      where: { id },
      data: { isEnabled },
    });
  }

  static async initializeDefaultFeatureFlags() {
    const flags = [
      { featureName: "AI_ROUTE_OPTIMIZATION", description: "Enables smart delivery agent route assignment and planning." },
      { featureName: "EXPRESS_DELIVERY", description: "Enables customers to select urgent express delivery at checkout." },
      { featureName: "WALLET_SYSTEM", description: "Allows customers to top up and pay using dynamic digital wallets." },
      { featureName: "MEMBERSHIP_PROGRAM", description: "Allows customers to subscribe to Bronze, Gold, and Platinum tier benefits." },
      { featureName: "REFERRAL_PROGRAM", description: "Enables customers to invite friends and gain loyalty cashback rewards." },
    ];

    for (const flag of flags) {
      await prisma.featureFlag.upsert({
        where: { featureName: flag.featureName },
        update: {},
        create: {
          featureName: flag.featureName,
          description: flag.description,
          isEnabled: false,
        },
      });
    }
  }
}
