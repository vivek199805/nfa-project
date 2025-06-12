// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js'; // Use .js extension for ES Modules

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});


