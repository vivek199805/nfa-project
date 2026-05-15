import { collectionByDelegate, delegateNames } from "../../adapters/shared/modelRegistry.js";

// Function to create and return Mongoose models
// for all registered delegates.
export const createMongooseModels = (mongooseClient) => {
  // Object that will store all generated models.
  const models = {};

  // Loop through every delegate name.
  //
  // Example delegate names:
  // user
  // featureForm
  // transaction
  for (const delegateName of delegateNames) {

    // Create a flexible Mongoose schema.
    //
    // strict: false
    // Allows fields that are not defined in schema.
    //
    // timestamps: true
    // Automatically adds createdAt and updatedAt.
    //
    // versionKey: false
    // Disables __v field.
    const schema = new mongooseClient.Schema({},
      {
        strict: false,
        timestamps: true,
        versionKey: false,
      }
    );

    // Convert delegate name into model name.
    //
    // Example:
    // user -> User
    // transaction -> Transaction
    const modelName = delegateName[0].toUpperCase() + delegateName.slice(1);

    // Get MongoDB collection name for this delegate.
    const collection = collectionByDelegate[delegateName];


    // Reuse existing Mongoose model if already registered.
    //
    // Otherwise create a new model.
    //
    // This prevents OverwriteModelError when code reloads.
    models[delegateName] = mongooseClient.models[modelName] ||
      mongooseClient.model(modelName, schema, collection);
  }


  // Return all created/reused models.
  //
  // Example:
  // {
  //   user: UserModel,
  //   transaction: TransactionModel
  // }
  return models;
};