import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const supportedProviders = new Set(["mongodb", "mysql"]);
const rootDir = process.cwd();
const sourceSchemaPath = path.join(rootDir, "prisma", "schema.prisma");
const generatedDir = path.join(rootDir, "prisma", "generated");
const generatedSchemaPath = path.join(generatedDir, "schema.prisma");

const requestedProvider = (
  process.argv[2] ||
  process.env.DB_PROVIDER ||
  "mongodb"
).trim().toLowerCase();

if (!supportedProviders.has(requestedProvider)) {
  console.error(
    `Unsupported provider "${requestedProvider}". Supported providers: ${Array.from(supportedProviders).join(", ")}`
  );
  process.exit(1);
}

const withMysqlNativeTypes = (schema) =>
  schema
    .replace(/(request_payload\s+String\?)/g, "$1 @db.LongText")
    .replace(/(response_payload\s+String\?)/g, "$1 @db.LongText");

const toMysqlSchema = (schema) =>
  withMysqlNativeTypes(schema)
    .replace(/provider\s*=\s*"mongodb"/, 'provider = "mysql"')
    .replace(/String\[\](\s*@db\.ObjectId)?/g, "Json?")
    .replace(/String\s+@id\s+@default\(auto\(\)\)\s+@map\("_id"\)\s+@db\.ObjectId/g, "String   @id @default(uuid())")
    .replace(/\s+@db\.ObjectId/g, "")
    .replace(/\s+@map\("_id"\)/g, "")
    .replace(/@default\(auto\(\)\)/g, "@default(uuid())");

const toMongoSchema = (schema) =>
  schema.replace(/provider\s*=\s*"(mongodb|mysql)"/, 'provider = "mongodb"');

const sourceSchema = fs.readFileSync(sourceSchemaPath, "utf8");
const generatedSchema =
  requestedProvider === "mysql"
    ? toMysqlSchema(sourceSchema)
    : toMongoSchema(sourceSchema);

fs.mkdirSync(generatedDir, { recursive: true });
fs.writeFileSync(generatedSchemaPath, generatedSchema);

console.log(`Generated ${requestedProvider} Prisma schema at ${path.relative(rootDir, generatedSchemaPath)}`);
