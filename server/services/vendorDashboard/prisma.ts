/**
 * Shared Prisma client for all vendor-dashboard services.
 * Avoids creating a new PrismaClient instance per module.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;
