import { createRequire } from "node:module";
import { getDatabaseUrl } from "../../config/databaseProvider.js";
import { delegateNames, featureContributorRelations, featureContributorRelationFields, } from "../shared/modelRegistry.js";
import { applySelect, stripUndefined, toPlainRecord } from "../shared/prismaShape.js";
import { createMongooseModels } from "../../models/mongoose/index.js";

// Create CommonJS require function inside ES Module environment.
// Needed because mongoose package is loaded dynamically
// using require() even though this file uses ES modules.
const require = createRequire(import.meta.url);


// Variables to store:
// - mongoose package instance
// - generated mongoose models
//
// Cached globally inside this module.
let mongoose;
let models;


// Function to dynamically load mongoose package.
//
// Loads mongoose only once (lazy loading).
//
// Useful when:
// ORM_PROVIDER=mongoose
//
// If mongoose package is not installed,
// throw descriptive error message.
const loadMongoose = () => {

  // If mongoose already loaded,
  // reuse existing instance.
  if (!mongoose) {
    try {
      // Dynamically import mongoose package.
      mongoose = require("mongoose");

    } catch {
      // Throw helpful installation error.
      throw new Error("ORM_PROVIDER=mongoose requires the mongoose package. Install it with npm install mongoose.");
    }
  }

  // Return mongoose instance.
  return mongoose;
};


// Regex pattern to validate MongoDB ObjectId.
//
// MongoDB ObjectId format:
// 24 hexadecimal characters
//
// Example:
// 507f1f77bcf86cd799439011
const objectIdPattern = /^[a-f\d]{24}$/i;


// Function to convert string IDs into MongoDB ObjectId.
//
// Example:
// "507f1f77bcf86cd799439011"
//
// becomes:
//
// new mongoose.Types.ObjectId(...)
const coerceId = (value) => {

  // Get mongoose instance.
  const mongooseClient = loadMongoose();

  // Convert valid ObjectId strings.
  if (typeof value === "string" && objectIdPattern.test(value)) {
    return new mongooseClient.Types.ObjectId(value);
  }

  // Return original value if not ObjectId.
  return value;
};


// Function to convert Prisma-style where filters
// into MongoDB/Mongoose query filters.
const mapWhere = (where = {}) => {

  const mapped = {};

  // Loop through all where conditions.
  for (const [field, value] of Object.entries(stripUndefined(where))) {

    // Skip relation fields handled separately.
    if (featureContributorRelationFields.includes(field)) continue;

    // Handle nested composite filter object.
    //
    // Flatten nested conditions recursively.
    if (field === "context_id_form_type_document_type_website_type" && value && typeof value === "object") {
      Object.assign(mapped, mapWhere(value));
      continue;
    }


    // Convert Prisma "id" field -> MongoDB "_id".
    const targetField = field === "id" ? "_id" : field;


    // Handle object operators.
    //
    // Example:
    // { id: { in: [...] } }
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      // Convert Prisma "in" operator -> MongoDB $in
      if ("in" in value) {
        mapped[targetField] = {
          $in: value.in.map(coerceId),
        };

      }

      // Convert Prisma "gt" operator -> MongoDB $gt
      else if ("gt" in value) {
        mapped[targetField] = {
          $gt: value.gt,
        };

      }

      // Recursively map nested filters.
      else {
        mapped[targetField] = mapWhere(value);
      }

    } else {
      // Convert _id values into ObjectId.
      mapped[targetField] = targetField === "_id" ? coerceId(value) : value;
    }
  }

  return mapped;
};


// Function to lazily initialize mongoose models.
const getModels = () => {

  // Reuse cached models if already created.
  if (models) return models;

  // Load mongoose.
  const mongooseClient = loadMongoose();

  // Create models dynamically.
  models = createMongooseModels(mongooseClient);

  return models;
};


// Function to load related feature contributor data.
//
// Similar to Prisma include relations.
const includeFeatureRelations = async (record, include = {}) => {

  // Skip if no record or no include options.
  if (!record || !include) return record;

  // Find requested relations to include.
  const activeRelations = featureContributorRelationFields.filter((relation) => include[relation]);

  // Return original record if no active relations.
  if (!activeRelations.length) return record;

  const allModels = getModels();

  // Clone original record.
  const enriched = { ...record };


  // Load all relations in parallel.
  await Promise.all(
    activeRelations.map(async (relation) => {

      // Get related model name.
      const delegateName = featureContributorRelations[relation];

      // Fetch related rows.
      const rows = await allModels[delegateName].find({ featureFormId: record.id }).lean();

      // Attach related data.
      enriched[relation] = rows.map(toPlainRecord);
    })
  );

  return enriched;
};


// Find one record using relation-based filters.
const findOneWithRelationFilter = async (Model, where = {}) => {

  // Find relation filter containing:
  // some.id
  const relationEntry = featureContributorRelationFields
    .map((relation) => [relation, where[relation]])
    .find(([, value]) => value?.some?.id);


  // If no relation filter,
  // run normal query.
  if (!relationEntry) {
    return Model.findOne(mapWhere(where)).lean();
  }

  // Extract relation + filter value.
  const [relation, value] = relationEntry;

  // Find related contributor document.
  const contributor = await getModels()[featureContributorRelations[relation]].findOne({ _id: coerceId(value.some.id), }).lean();

  // Return null if relation missing.
  if (!contributor?.featureFormId) return null;

  // Find main document using related featureFormId.
  return Model.findOne({
    ...mapWhere(where),
    _id: coerceId(contributor.featureFormId),
  }).lean();
};


// Create Prisma-like delegate methods for mongoose model.
//
// Mimics Prisma API:
//
// create()
// findUnique()
// findFirst()
// findMany()
// update()
// delete()
// upsert()
const createDelegate = (delegateName) => ({

  // Create document.
  create: async ({ data }) => toPlainRecord(await getModels()[delegateName].create(stripUndefined(data))),

  // Find one unique document.
  findUnique: async ({ where = {}, select, include } = {}) => {
    const record = toPlainRecord(await getModels()[delegateName].findOne(mapWhere(where)).lean());
    return applySelect(await includeFeatureRelations(record, include), select);
  },


  // Find first matching document.
  findFirst: async ({ where = {}, select, include } = {}) => {
    const record = toPlainRecord(await findOneWithRelationFilter(getModels()[delegateName], where));
    return applySelect(await includeFeatureRelations(record, include), select);
  },

  // Find multiple documents.
  findMany: async ({ where = {}, select, include } = {}) => {
    const records = await getModels()[delegateName].find(mapWhere(where)).lean();

    return Promise.all(
      records.map(async (record) => applySelect(await includeFeatureRelations(toPlainRecord(record), include), select))
    );
  },


  // Update one document.
  update: async ({ where = {}, data, select, include } = {}) => {

    const record =
      toPlainRecord(
        await getModels()[delegateName]
          .findOneAndUpdate(
            mapWhere(where),

            // MongoDB update operator
            { $set: stripUndefined(data) },

            // Return updated document
            { new: true }
          )
          .lean()
      );

    return applySelect(await includeFeatureRelations(record, include), select);
  },

  // Delete one document.
  delete: async ({ where = {} } = {}) => toPlainRecord(await getModels()[delegateName].findOneAndDelete(mapWhere(where)).lean()),

  // Update existing document or create new one.
  upsert: async ({ where = {}, create = {}, update = {} } = {}) =>

    toPlainRecord(await getModels()[delegateName].findOneAndUpdate(mapWhere(where),
      {
        $set: stripUndefined(update),

        // Insert only if document does not exist.
        $setOnInsert: stripUndefined(create),
      },

      {
        new: true,
        upsert: true,
      }
    )
      .lean()
    ),
});


// Create adapter object containing delegates
// for all models.
//
// Result example:
//
// mongooseAdapter.user.findMany()
// mongooseAdapter.post.create()
export const mongooseAdapter = Object.fromEntries(
  delegateNames.map((delegateName) => [delegateName, createDelegate(delegateName),])
);


// Function to connect mongoose to database.
export const connect = async () => {
  const mongooseClient = loadMongoose();
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for ORM_PROVIDER=mongoose");
  }

  // Connect to MongoDB.
  await mongooseClient.connect(databaseUrl);
};

// Function to disconnect mongoose connection.
export const disconnect = async () => {
  if (mongoose) {
    await mongoose.disconnect();
  }
};


// Export adapter as default export.
export default mongooseAdapter;
