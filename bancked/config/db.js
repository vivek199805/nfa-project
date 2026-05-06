import mongoose from "mongoose";

// These settings enable strict query validation and filter sanitization for security and schema compliance.
mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

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
