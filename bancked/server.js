// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { runStartupMaintenance } from "./services/maintenance.js";

const PORT = process.env.PORT || 3000;

// const server = http.createServer(app); // Create HTTP server without express()

const startServer = async () => {
  try {
    await connectDB();
    await runStartupMaintenance();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

// # //server
// NODE_ENV=development
// PORT=5000
// DB_URL=mongodb+srv://98vivekumar:M85pedTpXkr5ALlO@cluster0.sic5q1w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// JWT_SECRET=vivekkumar94

// # MAILER

// MAIL_HOST=smtp.ethereal.email
// MAIL_DRIVER=smtp
// MAIL_PORT=587
// MAIL_FROM_ADDRESS=digitalteam@nfdcindia.com
// MAIL_FROM=Digital-Team
// MAIL_ENCRYPTION=tls
// MAIL_USERNAME=daren76@ethereal.email
// MAIL_PASSWORD=NwRqHuCSNWw8jGfTcS

// # FRONT-END-BASE-URL
// FRONTEND_BASE_URL=http://localhost:5173

// RAZORPAY_KEY_ID=rzp_test_SicSCTBmKwh4Bk
// RAZORPAY_KEY_SECRET=mWB1ofNyFlkgzb50tAFFPOhE
// RAZORPAY_DEFAULT_AMOUNT=
// RAZORPAY_FEATURE_AMOUNT=
// RAZORPAY_NON_FEATURE_AMOUNT=
// RAZORPAY_BEST_BOOK_AMOUNT=
// RAZORPAY_BEST_FILM_CRITIC_AMOUNT=


