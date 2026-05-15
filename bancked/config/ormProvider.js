// Define all supported ORM providers used in the application.
//
// Object.freeze() prevents modification of the object.
// This ensures provider names remain constant throughout the app.
export const ORM_PROVIDERS = Object.freeze({
  // Prisma ORM for both MongoDB and SQL databases  
  PRISMA: "prisma",

  // Mongoose ODM for MongoDB
  MONGOOSE: "mongoose",

  // Sequelize ORM for SQL databases
  SEQUELIZE: "sequelize",
});


// Create a Set containing all supported ORM provider values.
//
// Result:
// Set { "prisma", "mongoose", "sequelize" }
//
// Used for fast validation checks.
const SUPPORTED_ORM_PROVIDERS = new Set(Object.values(ORM_PROVIDERS));


// Function to get currently selected ORM provider.
//
// Priority:
// 1. Read ORM_PROVIDER from environment variables
// 2. Default to Prisma if not provided
//
// Example:
// ORM_PROVIDER=mongoose
//
// Output:
// "mongoose"
//
// trim() removes extra spaces.
// toLowerCase() ensures case-insensitive comparison.
export const getOrmProvider = (env = process.env) => {

  const provider = (env.ORM_PROVIDER || ORM_PROVIDERS.PRISMA).trim().toLowerCase();

  // Validate whether provider is supported.
  //
  // If invalid:
  // throw descriptive error and stop execution.
  //
  // Example invalid value:
  // ORM_PROVIDER=typeorm
  if (!SUPPORTED_ORM_PROVIDERS.has(provider)) {
    throw new Error(`Unsupported ORM_PROVIDER "${provider}". Supported providers: ${Array.from(SUPPORTED_ORM_PROVIDERS).join(", ")}`);
  }

  // Return validated ORM provider.
  return provider;
};


// Helper function to check if current ORM is Prisma.
//
// Returns:
// true  -> if ORM_PROVIDER=prisma
// false -> otherwise
export const isPrismaOrm = (env = process.env) =>
  getOrmProvider(env) === ORM_PROVIDERS.PRISMA;


// Helper function to check if current ORM is Mongoose.
//
// Returns:
// true  -> if ORM_PROVIDER=mongoose
// false -> otherwise
export const isMongooseOrm = (env = process.env) =>
  getOrmProvider(env) === ORM_PROVIDERS.MONGOOSE;


// Helper function to check if current ORM is Sequelize.
//
// Returns:
// true  -> if ORM_PROVIDER=sequelize
// false -> otherwise
export const isSequelizeOrm = (env = process.env) =>
  getOrmProvider(env) === ORM_PROVIDERS.SEQUELIZE;