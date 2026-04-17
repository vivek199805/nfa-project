import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    // Keep local/dev environments running when .env is not loaded yet.
    return "dev-insecure-jwt-secret";
  }

  throw new Error("JWT_SECRET is required in production");
}

export function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
