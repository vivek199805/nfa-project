// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js'; // Use .js extension for ES Modules

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Example commented block in ES Module style
// import User from './models/User.js'; // Assuming you have this model

// const main = async () => {
//   const user = await User.findById("hhuhhjhjjhkkk");
//   await user.populate('Tasks');
//   console.log(user.tasks);
// };

// main();
