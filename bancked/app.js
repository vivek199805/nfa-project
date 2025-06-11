// package.json should include: "type": "module"

import express from 'express';
import dotenv from "dotenv";
// import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js'; // Make sure the file extension is .js
import addressRoutes from "./routes/addresses.js";
import paymentRoutes from "./routes/payment.js";
import cartRoutes from "./routes/cart.js";
import ordersRoutes from "./routes/order.js";
import productRoutes from "./routes/product.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// mongoose.set('strictQuery', true);
// Uncomment and update this with valid credentials if needed
// mongoose.connect("mongodb://localhost:27017/cafe-management", {
//   useNewUrlParser: true,
// })
// .then(() => console.log("Connection Successful..."))
// .catch((err) => console.log(err));

app.use(cors()); // CORS middleware

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/user", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productRoutes);

export default app;
