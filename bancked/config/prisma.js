// Import PrismaClient from generated Prisma package.
//
// PrismaClient is the main interface used to interact
// with the database using Prisma ORM.
import { PrismaClient } from "@prisma/client";
import { getDatabaseProvider } from "./databaseProvider.js";

// Import function that resolves the database connection URL.
//
// Useful for:
// - multi-tenant systems
// - dynamic database selection
// - tenant-specific database connections
import { resolveDatabaseUrl } from "./tenantDatabaseResolver.js";

// Reference to global object.
//
// globalThis works across Node.js environments
// and allows sharing a single Prisma instance globally.
const globalForPrisma = globalThis;


// Get currently selected database provider.
//
// Example:
// mongodb
// mysql
const databaseProvider = getDatabaseProvider();


// Resolve actual database connection URL dynamically.
//
// Example:
// mongodb://localhost:27017/app
// mysql://user:pass@localhost:3306/app
const databaseUrl = resolveDatabaseUrl();


// If a database URL exists,
// override/set DATABASE_URL environment variable.
//
// Prisma automatically reads DATABASE_URL internally.
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}


// Create Prisma client instance.
//
// Reuse existing global Prisma instance if available.
// Otherwise create a new PrismaClient.
//
// This prevents multiple Prisma instances during development
// because hot reloads can recreate modules repeatedly.
const prisma =
  globalForPrisma.prisma ||

  new PrismaClient({

    // Enable Prisma logs.
    //
    // In development:
    // - query logs
    // - errors
    // - warnings
    //
    // In production:
    // - errors only
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });


// Store Prisma instance globally in non-production environments.
//
// Prevents:
//
/*
  Warning:
  "There are already multiple Prisma Clients actively running"
*/
//
// Commonly used in:
// - Next.js
// - Nodemon
// - Vite
// - Hot reload environments
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


// Function to establish Prisma database connection.
export const connectPrisma = async () => {

  try {
    // Connect to database.
    await prisma.$connect();

    // Log successful connection.
    console.log(`Prisma connected successfully using ${databaseProvider}`);

  } catch (error) {
    // Log connection failure.
    console.error("Prisma connection failed:", error.message);

    // Exit application if database connection fails.
    process.exit(1);
  }
};


// Function to disconnect Prisma client gracefully.
//
// Useful during:
// - app shutdown
// - testing cleanup
// - server restart
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

// Export Prisma instance as default export.
export default prisma;