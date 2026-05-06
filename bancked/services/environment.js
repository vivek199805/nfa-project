const weakJwtSecrets = new Set([
  "your-jwt-secret",
  "change-me",
  "changeme",
  "secret",
  "jwt-secret",
]);

const requiredEnvironment = ["DB_URL", "JWT_SECRET"];

export function validateStartupEnvironment(env = process.env) {
  const errors = [];
  const nodeEnv = env.NODE_ENV || "development";

  for (const key of requiredEnvironment) {
    if (!env[key]?.trim()) {
      errors.push(`${key} is required`);
    }
  }

  if (nodeEnv === "production") {
    if (!env.CORS_ORIGIN?.trim()) {
      errors.push("CORS_ORIGIN is required in production");
    }

    if (weakJwtSecrets.has(env.JWT_SECRET?.trim())) {
      errors.push("JWT_SECRET must be changed from the example value in production");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function assertStartupEnvironment(env = process.env) {
  const result = validateStartupEnvironment(env);

  if (!result.isValid) {
    throw new Error(`Invalid environment configuration: ${result.errors.join("; ")}`);
  }
}
