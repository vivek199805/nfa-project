// This function checks:
// 1. DATABASE_URL
// 2. DB_URL
// and returns whichever is available.
import { getDatabaseUrl } from "./databaseProvider.js";

// Function to parse tenant-specific database URLs
// from environment variables.
//
// Expected environment variable format:
//
// TENANT_DATABASE_URLS='{
//   "tenant1": "mongodb://localhost:27017/tenant1",
//   "tenant2": "mysql://user:pass@localhost:3306/tenant2"
// }'
//
// Returns:
// {
//   tenant1: "...",
//   tenant2: "..."
// }
//
// If parsing fails or variable is missing,
// returns empty object {}.
const parseTenantUrls = (env = process.env) => {

  // If no tenant URLs configured,
  // return empty object.
  if (!env.TENANT_DATABASE_URLS) return {};

  try {

    // Parse JSON string into JavaScript object.
    return JSON.parse(env.TENANT_DATABASE_URLS);

  } catch {

    // If JSON is invalid,
    // safely return empty object instead of crashing.
    return {};
  }
};

// Function to resolve final database URL.
//
// Supports:
// - tenant-specific databases
// - default tenant fallback
// - global database fallback
//
// Parameters:
// tenantId -> current tenant identifier
// env      -> environment variables object
export const resolveDatabaseUrl = ({ tenantId, env = process.env } = {}) => {

  // Get all tenant database URLs.
  const tenantUrls = parseTenantUrls(env);

  // Check whether requested tenant has a dedicated database URL.
  //
  // Example:
  // tenantId = "tenant1"
  //
  // Returns:
  // tenantUrls["tenant1"]
  if (tenantId && tenantUrls[tenantId]) {
    return tenantUrls[tenantId];
  }

  // If tenantId not provided,
  // check for DEFAULT_TENANT_ID.
  //
  // Example:
  // DEFAULT_TENANT_ID=tenant1
  //
  // Uses default tenant database connection.
  if (env.DEFAULT_TENANT_ID && tenantUrls[env.DEFAULT_TENANT_ID]) {
    return tenantUrls[env.DEFAULT_TENANT_ID];
  }

  return getDatabaseUrl(env);
};