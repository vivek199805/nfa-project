import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(_scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}
