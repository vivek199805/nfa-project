import { PrismaClient } from "@prisma/client";
import { getDatabaseProvider } from "./databaseProvider.js";
import { resolveDatabaseUrl } from "./tenantDatabaseResolver.js";

const globalForPrisma = globalThis;
const databaseProvider = getDatabaseProvider();
const databaseUrl = resolveDatabaseUrl();

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectPrisma = async () => {
  try {
    await prisma.$connect();
    console.log(`Prisma connected successfully using ${databaseProvider}`);
  } catch (error) {
    console.error("Prisma connection failed:", error.message);
    process.exit(1);
  }
};

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
