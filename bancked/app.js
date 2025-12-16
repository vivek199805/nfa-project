// package.json should include: "type": "module"

import express from 'express';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/mongoDBRoutes/auth.js';
import langRoutes from './routes/mongoDBRoutes/languages.js';
import filmSubmissionRoutes from './routes/mongoDBRoutes/filmSubmission.js';
import entryListRoutes from './routes/mongoDBRoutes/entryList.js';
import ApiRoutes from './routes/mongoDBRoutes/apiRoutes.js';
dotenv.config();
const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(cookieParser());

// --- MongoDB Connection ---
mongoose.set('strictQuery', true);
// Uncomment and update this with valid credentials if needed
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
    });
    console.log('Connection Successful...');
  } catch (err) {
    console.error(err);
  }
};

connectDB();

app.use(cors());
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
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }


// --- Routes ---
app.use("/api/user", authRoutes);
app.use("/api", langRoutes);
app.use("/api", entryListRoutes);
app.use("/api/film", filmSubmissionRoutes);
app.use("/api", ApiRoutes);

export default app;
