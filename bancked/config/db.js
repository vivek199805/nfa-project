import { getDatabaseProvider } from "./databaseProvider.js";
import { getOrmProvider } from "./ormProvider.js";
import { connectOrm, disconnectOrm } from "../db/index.js";

export const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL && process.env.DB_URL) {
      process.env.DATABASE_URL = process.env.DB_URL;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const databaseProvider = getDatabaseProvider();
    const ormProvider = getOrmProvider();

    await connectOrm();

    console.log(`${ormProvider} database connection successful for ${databaseProvider}...`);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await disconnectOrm();
};
