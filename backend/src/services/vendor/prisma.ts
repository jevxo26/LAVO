import prisma from "../../config/prisma";
/**
 * Shared Prisma client for all vendor-dashboard services.
 * Avoids creating a new PrismaClient instance per module.
 */
import { PrismaClient } from "@prisma/client";

export default prisma;
