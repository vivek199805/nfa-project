// package.json should include: "type": "module"

import express from "express";
// import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/mongoDBRoutes/auth.js";
import langRoutes from "./routes/mongoDBRoutes/languages.js";
import filmSubmissionRoutes from "./routes/mongoDBRoutes/filmSubmission.js";
import entryListRoutes from "./routes/mongoDBRoutes/entryList.js";
import ApiRoutes from "./routes/mongoDBRoutes/apiRoutes.js";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";

// dotenv.config();
const app = express();
app.disable("x-powered-by");

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
app.use(cookieParser());

function getCorsOrigin() {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return true;
  }

  throw new Error("CORS_ORIGIN is required outside development and test");
}

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
);

// HTTP request logger (only in dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Use rate limit middleware (applied in all environments for consistency, but trust proxy only in production)
app.use(limiter);
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- Routes ---
app.use("/api/user", authRoutes);
app.use("/api", langRoutes);
app.use("/api", entryListRoutes);
app.use("/api/film", filmSubmissionRoutes);
app.use("/api", ApiRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    statusCode: 404,
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  const status = err.status || (err.name === "MulterError" ? 422 : 500);
  console.error(`Error: ${err.message}`); // Log for debugging, avoid sensitive data
  res.status(status).json({
    message: err.message || "Internal Server Error",
    statusCode: status,
    path: req.originalUrl,
  });
});

export default app;
