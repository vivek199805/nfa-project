// package.json should include: "type": "module"

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/mongoDBRoutes/auth.js";
import langRoutes from "./routes/mongoDBRoutes/languages.js";
import filmSubmissionRoutes from "./routes/mongoDBRoutes/filmSubmission.js";
import entryListRoutes from "./routes/mongoDBRoutes/entryList.js";
import ApiRoutes from "./routes/mongoDBRoutes/apiRoutes.js";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
dotenv.config();
const app = express();

// Allow max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(cookieParser());

app.use(cors());

// const corsOrigin = process.env.CORS_ORIGIN
//   ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
//   : true;

// app.use(
//   cors({
//     origin: corsOrigin,
//     credentials: true,
//   })
// );

// CORS middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // frontend URL
//   credentials: true
// }));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, PUT, DELETE, OPTIONS"
//   );
//   next();
// });

// HTTP request logger (only in dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// use ratelimit middleware
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(limiter); // apply rate limiting in production
}

// --- MongoDB Connection ---
mongoose.set("strictQuery", true);
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
    });
    console.log('Connection Successful...');
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// --- Routes ---
app.use("/api/user", authRoutes);
app.use("/api", langRoutes);
app.use("/api", entryListRoutes);
app.use("/api/film", filmSubmissionRoutes);
app.use("/api", ApiRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

//  Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    path: req.originalUrl,
  });
});

export default app;
