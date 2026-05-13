import assert from "node:assert/strict";
import test from "node:test";
import { resolveDatabaseUrl } from "./tenantDatabaseResolver.js";

test("tenant resolver uses trusted tenant mapping before default database URL", () => {
  const originalDefault = process.env.DATABASE_URL;
  const originalTenants = process.env.TENANT_DATABASE_URLS;
  const originalNodeEnv = process.env.NODE_ENV;

  process.env.NODE_ENV = "production";
  process.env.DATABASE_URL = "mongodb://localhost/default";
  process.env.TENANT_DATABASE_URLS = JSON.stringify({
    nfa: "mongodb://localhost/nfa",
  });

  assert.equal(resolveDatabaseUrl({ tenantId: "nfa" }), "mongodb://localhost/nfa");

  process.env.NODE_ENV = originalNodeEnv;
  if (originalDefault === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDefault;
  if (originalTenants === undefined) delete process.env.TENANT_DATABASE_URLS;
  else process.env.TENANT_DATABASE_URLS = originalTenants;
});
