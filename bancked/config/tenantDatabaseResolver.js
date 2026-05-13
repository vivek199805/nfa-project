import { getDatabaseUrl } from "./databaseProvider.js";

const parseTenantUrls = (env = process.env) => {
  if (!env.TENANT_DATABASE_URLS) return {};

  try {
    return JSON.parse(env.TENANT_DATABASE_URLS);
  } catch {
    return {};
  }
};

export const resolveDatabaseUrl = ({ tenantId, env = process.env } = {}) => {
  const tenantUrls = parseTenantUrls(env);

  if (tenantId && tenantUrls[tenantId]) {
    return tenantUrls[tenantId];
  }

  if (env.DEFAULT_TENANT_ID && tenantUrls[env.DEFAULT_TENANT_ID]) {
    return tenantUrls[env.DEFAULT_TENANT_ID];
  }

  return getDatabaseUrl(env);
};
