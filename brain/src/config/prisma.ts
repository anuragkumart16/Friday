import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton.
 *
 * Ensures only one PrismaClient instance is created and reused
 * across the application to prevent connection pool exhaustion.
 */
const prisma = new PrismaClient();

export default prisma;
