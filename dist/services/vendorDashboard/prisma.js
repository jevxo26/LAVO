"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Shared Prisma client for all vendor-dashboard services.
 * Avoids creating a new PrismaClient instance per module.
 */
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = prisma;
