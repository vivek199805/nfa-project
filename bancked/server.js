// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// import http from 'http';
import app, { connectDB } from "./app.js";

const PORT = process.env.PORT || 3000;

// const server = http.createServer(app); // Create HTTP server without express()

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();


