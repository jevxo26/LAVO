import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { getVendorByUserId } from "./overviewService";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VendorServiceRow {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  garmentType: string;
  processingTime: string;
  price: number;
  minimumOrder: number;
  maximumOrder: number | null;
  status: string;
  processingCost: number;
  vendorRate: number;
  createdAt: Date;
}

export interface UpdateServiceData {
  processingTime?: string;
  price?: number;
  minimumOrder?: number;
  maximumOrder?: number | null;
  status?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getServices = async (userId: string): Promise<VendorServiceRow[]> => {
  const vendor = await getVendorByUserId(userId);

  // Fetch VendorService rows for this vendor
  const vendorServices = await prisma.vendorService.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  });

  // VendorService.serviceId is a plain string — no Prisma relation defined.
  // Fetch Service + GarmentType + GarmentCategory separately and build a map.
  const serviceIds = vendorServices.map((vs) => vs.serviceId);

  const [services, pricings] = await Promise.all([
    prisma.service.findMany({
      where: { id: { in: serviceIds } },
      include: {
        garmentType: { include: { category: true } },
      },
    }),
    prisma.vendorPricing.findMany({
      where: { vendorId: vendor.id },
    }),
  ]);

  const serviceMap  = new Map(services.map((s) => [s.id, s]));
  const pricingMap  = new Map(pricings.map((p) => [p.serviceId, p]));

  return vendorServices.map((vs) => {
    const service = serviceMap.get(vs.serviceId);
    const pricing = pricingMap.get(vs.serviceId);
    return {
      id:             vs.id,
      serviceId:      vs.serviceId,
      serviceName:    service?.serviceName                   ?? 'Unnamed Service',
      category:       service?.garmentType?.category?.name  ?? 'General',
      garmentType:    service?.garmentType?.name            ?? 'General',
      processingTime: vs.processingTime ?? '',
      price:          vs.price,
      minimumOrder:   vs.minimumOrder,
      maximumOrder:   vs.maximumOrder ?? null,
      status:         vs.status,
      processingCost: pricing?.processingCost ?? 0,
      vendorRate:     pricing?.vendorRate     ?? 0,
      createdAt:      vs.createdAt,
    };
  });
};

export const updateService = async (
  userId: string,
  serviceId: string,
  data: UpdateServiceData,
): Promise<Prisma.VendorServiceGetPayload<object>> => {
  const vendor = await getVendorByUserId(userId);
  const vs = await prisma.vendorService.findFirst({
    where: { id: serviceId, vendorId: vendor.id },
  });
  if (!vs) throw new Error('Service not found');

  return prisma.vendorService.update({ where: { id: serviceId }, data });
};

export const toggleServiceStatus = async (
  userId: string,
  serviceId: string,
): Promise<Prisma.VendorServiceGetPayload<object>> => {
  const vendor = await getVendorByUserId(userId);
  const vs = await prisma.vendorService.findFirst({
    where: { id: serviceId, vendorId: vendor.id },
  });
  if (!vs) throw new Error('Service not found');

  return prisma.vendorService.update({
    where: { id: serviceId },
    data: { status: vs.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
  });
};
