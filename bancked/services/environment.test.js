import test from "node:test";
import assert from "node:assert/strict";
import {
  assertStartupEnvironment,
  validateStartupEnvironment,
} from "./environment.js";

test("validateStartupEnvironment accepts the minimum development configuration", () => {
  const result = validateStartupEnvironment({
    NODE_ENV: "development",
    DB_URL: "mongodb://localhost:27017/nfa-project",
    JWT_SECRET: "local-dev-secret",
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, []);
});

test("validateStartupEnvironment requires database and JWT settings", () => {
  const result = validateStartupEnvironment({
    NODE_ENV: "development",
  });

  assert.equal(result.isValid, false);
  assert.deepEqual(result.errors, [
    "DB_URL is required",
    "JWT_SECRET is required",
  ]);
});

test("validateStartupEnvironment requires explicit CORS origin in production", () => {
  const result = validateStartupEnvironment({
    NODE_ENV: "production",
    DB_URL: "mongodb://localhost:27017/nfa-project",
    JWT_SECRET: "strong-production-secret",
  });

  assert.equal(result.isValid, false);
  assert.deepEqual(result.errors, ["CORS_ORIGIN is required in production"]);
});

test("validateStartupEnvironment rejects example JWT secrets in production", () => {
  const result = validateStartupEnvironment({
    NODE_ENV: "production",
    DB_URL: "mongodb://localhost:27017/nfa-project",
    JWT_SECRET: "your-jwt-secret",
    CORS_ORIGIN: "https://nfa.example.com",
  });

  assert.equal(result.isValid, false);
  assert.deepEqual(result.errors, [
    "JWT_SECRET must be changed from the example value in production",
  ]);
});

test("assertStartupEnvironment throws with combined configuration errors", () => {
  assert.throws(
    () => assertStartupEnvironment({ NODE_ENV: "production" }),
    /DB_URL is required; JWT_SECRET is required; CORS_ORIGIN is required in production/,
  );
});
