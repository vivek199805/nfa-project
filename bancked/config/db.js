import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export const connectDB = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL is required");
    }

    await mongoose.connect(process.env.DB_URL);
    console.log("Connection Successful...");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
