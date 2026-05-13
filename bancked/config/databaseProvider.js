export const DATABASE_PROVIDERS = Object.freeze({
  MONGODB: "mongodb",
  MYSQL: "mysql",
});

const SUPPORTED_PROVIDERS = new Set(Object.values(DATABASE_PROVIDERS));

export const getDatabaseProvider = (env = process.env) => {
  const provider = (env.DB_PROVIDER || DATABASE_PROVIDERS.MONGODB).trim().toLowerCase();

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw new Error(
      `Unsupported DB_PROVIDER "${provider}". Supported providers: ${Array.from(SUPPORTED_PROVIDERS).join(", ")}`
    );
  }

  return provider;
};

export const isMongoProvider = (env = process.env) =>
  getDatabaseProvider(env) === DATABASE_PROVIDERS.MONGODB;

export const isMysqlProvider = (env = process.env) =>
  getDatabaseProvider(env) === DATABASE_PROVIDERS.MYSQL;

export const getDatabaseUrl = (env = process.env) => env.DATABASE_URL || env.DB_URL || "";
