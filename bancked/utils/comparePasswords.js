import { scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(_scrypt);

export async function comparePasswords(
  suppliedPassword,
  storedPassword
){
  const [hashed, salt] = storedPassword.split(".");
  const buf = (await scryptAsync(suppliedPassword, salt, 64));
  return hashed === buf.toString("hex");
}
