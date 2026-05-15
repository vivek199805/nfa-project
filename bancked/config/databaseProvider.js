// Define all supported database providers used in the application.
//
// Object.freeze() makes the object immutable,
// preventing accidental modification of provider names.
export const DATABASE_PROVIDERS = Object.freeze({
  MONGODB: "mongodb",
  MYSQL: "mysql",
});

// Create a Set of supported database provider values.
//
// Result:
// Set { "mongodb", "mysql" }
//
// Used for quick validation checks.
const SUPPORTED_PROVIDERS = new Set(Object.values(DATABASE_PROVIDERS));

// Function to get the currently selected database provider.
//
// Priority:
// 1. Read DB_PROVIDER from environment variables
// 2. Default to MongoDB if not specified
//
// Example:
// DB_PROVIDER=mysql
//
// Output:
// "mysql"
//
// trim() removes extra spaces.
// toLowerCase() makes comparison case-insensitive.
export const getDatabaseProvider = (env = process.env) => {
  const provider = (env.DB_PROVIDER || DATABASE_PROVIDERS.MONGODB).trim().toLowerCase();

  // Validate whether selected provider is supported.
  //
  // If unsupported:
  // throw descriptive error.
  //
  // Example invalid value:
  // DB_PROVIDER=postgres
  if (!SUPPORTED_PROVIDERS.has(provider)) {

    throw new Error(
      `Unsupported DB_PROVIDER "${provider}". Supported providers: ${Array.from(
        SUPPORTED_PROVIDERS
      ).join(", ")}`
    );
  }

  // Return validated provider.
  return provider;
};

// Helper function to check if current database provider is MongoDB.
//
// Returns:
// true  -> if DB_PROVIDER=mongodb
// false -> otherwise
export const isMongoProvider = (env = process.env) => getDatabaseProvider(env) === DATABASE_PROVIDERS.MONGODB;

// Helper function to check if current database provider is MySQL.
//
// Returns:
// true  -> if DB_PROVIDER=mysql
// false -> otherwise
export const isMysqlProvider = (env = process.env) => getDatabaseProvider(env) === DATABASE_PROVIDERS.MYSQL;


// Function to get database connection URL.
//
// Priority:
// 1. DATABASE_URL
// 2. DB_URL
// 3. Empty string if neither exists
//
// Useful for supporting multiple environment variable naming conventions.
//
// Example:
// DATABASE_URL=mongodb://localhost:27017/app
//
// OR
// DB_URL=mysql://user:pass@localhost:3306/app
export const getDatabaseUrl = (env = process.env) => env.DATABASE_URL || env.DB_URL || "";