import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
