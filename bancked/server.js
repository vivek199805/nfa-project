// Load environment variables from .env file
// import dotenv from 'dotenv';
// dotenv.config();
// dotenv.config({
//   path: `.env.${process.env.NODE_ENV}`,
// });


import app from "./app.js";
import { connectDB } from "./config/db.js";
import { assertStartupEnvironment } from "./services/environment.js";

const PORT = process.env.PORT || 3000;
// "start": "cross-env NODE_ENV=development nodemon server.js",
// const server = http.createServer(app); // Create HTTP server without express()

const startServer = async () => {
  try {
    assertStartupEnvironment();
    await connectDB();
    // await runStartupMaintenance();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

// NODE_ENV=development
// PORT=5000
// DB_PROVIDER=mysql
// # ORM_PROVIDER="mongoose"
// DB_URL=mysql://root:Vivek@94305@localhost:3306/nfa_project
// DATABASE_URL=mysql://root:Vivek@94305@localhost:3306/nfa_project
// # DATABASE_URL="mongodb://localhost:27017/nfa-project"
// # DB_URL="mongodb://localhost:27017/nfa-project"
// PRISMA_QUERY_LOG =true
// JWT_SECRET=your-jwt-secret
// CORS_ORIGIN=http://localhost:5173

// # MAILER
// MAIL_HOST=smtp.mail.yahoo.com
// MAIL_DRIVER=smtp
// MAIL_MAILER=smtp
// MAIL_PORT=465
// MAIL_SECURE=false
// MAIL_SERVICE=
// MAIL_FROM_ADDRESS=vivek.kumar@pivotalflow.tech
// MAIL_PASSWORD=idsebxzvtzmbelcl
// # MAIL_FROM=Digital-Team
// MAIL_ENCRYPTION=ssl
// MAIL_USERNAME=vivek.kumar@pivotalflow.tech
// MAIL_FROM_NAME=Vivek Kumar

// FRONTEND_BASE_URL=http://localhost:5173
// ALLOW_DEV_OTP_BYPASS=true

// RAZORPAY_KEY_ID=rzp_test_SicSCTBmKwh4Bk
// RAZORPAY_KEY_SECRET=mWB1ofNyFlkgzb50tAFFPOhE
// RAZORPAY_DEFAULT_AMOUNT=100
// RAZORPAY_FEATURE_AMOUNT=100
// RAZORPAY_NON_FEATURE_AMOUNT=100
// RAZORPAY_BEST_BOOK_AMOUNT=100
// RAZORPAY_BEST_FILM_CRITIC_AMOUNT=500

// UPLOAD_ROOT=
// MAX_UPLOAD_FILE_SIZE=10485760
// MAX_UPLOAD_FILES=10

// REDIS_URL=redis://localhost:6379

