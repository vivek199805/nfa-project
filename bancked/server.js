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
