import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// A set containing all database providers supported by this project.
// Used to validate provider input like "mongodb" or "mysql".
const supportedProviders = new Set(["mongodb", "mysql"]);

// Gets the current project root directory where the script is running.
// Example: /Users/vivek/project-name
const rootDir = process.cwd();

// Absolute path to the main Prisma schema source file.
// Example: /project/prisma/schema.prisma
const sourceSchemaPath = path.join(rootDir, "prisma", "schema.prisma");

// Absolute path to the folder where generated Prisma schema files will be stored.
// Example: /project/prisma/generated
const generatedDir = path.join(rootDir, "prisma", "generated");

// Absolute path to the final generated Prisma schema file.
// Example: /project/prisma/generated/schema.prisma
const generatedSchemaPath = path.join(generatedDir, "schema.prisma");

// Get database provider from:
// 1. Command line argument
// 2. Environment variable DB_PROVIDER
// 3. Default to "mongodb"
//
// Example:
// node build-prisma-schema.js mysql
//
// OR
// DB_PROVIDER=mysql node build-prisma-schema.js
//
// Result is trimmed and converted to lowercase.
const requestedProvider = (
  process.argv[2] ||
  process.env.DB_PROVIDER ||
  "mongodb"
).trim().toLowerCase();


// Validate whether the selected provider is supported.
// If provider is not "mongodb" or "mysql",
// print an error and stop execution.
if (!supportedProviders.has(requestedProvider)) {
  console.error(`Unsupported provider "${requestedProvider}". Supported providers: ${Array.from(supportedProviders).join(", ")}`);
  process.exit(1);
}


// Adds MySQL-specific native types to schema fields.
//
// Converts:
// request_payload String?
// into:
// request_payload String? @db.LongText
//
// Same for response_payload.
//
// This is useful because MySQL TEXT has size limits,
// and LongText supports very large JSON/string payloads.
const withMysqlNativeTypes = (schema) =>
  schema
    .replace(/(request_payload\s+String\?)/g, "$1 @db.LongText")
    .replace(/(response_payload\s+String\?)/g, "$1 @db.LongText");


// Converts MongoDB Prisma schema into MySQL-compatible schema.
const toMysqlSchema = (schema) =>
  withMysqlNativeTypes(schema)

    // Change Prisma provider from mongodb -> mysql
    .replace(/provider\s*=\s*"mongodb"/, 'provider = "mysql"')

    // Convert MongoDB array fields to MySQL Json fields.
    //
    // Example:
    // String[] @db.ObjectId
    // becomes:
    // Json?
    .replace(/String\[\](\s*@db\.ObjectId)?/g, "Json?")

    // Convert MongoDB ObjectId primary key to UUID-based MySQL ID.
    //
    // From:
    // String @id @default(auto()) @map("_id") @db.ObjectId
    //
    // To:
    // String @id @default(uuid())
    .replace(
      /String\s+@id\s+@default\(auto\(\)\)\s+@map\("_id"\)\s+@db\.ObjectId/g,
      "String   @id @default(uuid())"
    )

    // Remove MongoDB-specific ObjectId annotations.
    .replace(/\s+@db\.ObjectId/g, "")

    // Remove MongoDB "_id" field mapping.
    .replace(/\s+@map\("_id"\)/g, "")

    // Replace MongoDB auto() with uuid() for MySQL IDs.
    .replace(/@default\(auto\(\)\)/g, "@default(uuid())");


// Converts schema back to MongoDB provider.
//
// Replaces provider=mysql or provider=mongodb
// with provider=mongodb
const toMongoSchema = (schema) =>
  schema.replace(
    /provider\s*=\s*"(mongodb|mysql)"/,
    'provider = "mongodb"'
  );


// Read original Prisma schema file as UTF-8 text.
const sourceSchema = fs.readFileSync(sourceSchemaPath, "utf8");


// Generate schema based on requested provider.
//
// If provider is mysql:
//   Convert schema to MySQL-compatible version
//
// Otherwise:
//   Use MongoDB version
const generatedSchema =
  requestedProvider === "mysql"
    ? toMysqlSchema(sourceSchema)
    : toMongoSchema(sourceSchema);


// Create generated directory if it doesn't already exist.
//
// recursive: true means:
// create parent folders automatically if needed.
fs.mkdirSync(generatedDir, { recursive: true });


// Write final generated schema into:
//
// prisma/generated/schema.prisma
fs.writeFileSync(generatedSchemaPath, generatedSchema);


// Print success message showing generated schema path.
console.log(
  `Generated ${requestedProvider} Prisma schema at ${path.relative(
    rootDir,
    generatedSchemaPath
  )}`
);