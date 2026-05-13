import { connectPrisma, disconnectPrisma } from "./prisma.js";
import { getDatabaseProvider } from "./databaseProvider.js";

export const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL && process.env.DB_URL) {
      process.env.DATABASE_URL = process.env.DB_URL;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const provider = getDatabaseProvider();

    await connectPrisma();

    console.log(`Prisma database connection successful for ${provider}...`);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await disconnectPrisma();
};
