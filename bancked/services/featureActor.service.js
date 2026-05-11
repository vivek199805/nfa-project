import {FeatureForm} from "../models/mongodbModels/featureForm.js";
const mapActors = (actors = []) =>
  actors.map((item) => {
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
  });

export const getActorsByFeatureIdService = async ({ featureId, userId }) => {
  const feature = await FeatureForm.findOne(
    {
      _id: featureId,
      client_id: userId,
    },
    "actors"
  );

  if (!feature) {
    return {
      statusCode: 203,
      message: "Records not found",
    };
  }

  return {
    statusCode: 200,
    message: "Data fetched successfully",
    data: feature.actors,
  };
};

export const saveActorToFeatureService = async ({
  featureId,
  actorId,
  userId,
  payload,
}) => {
  const feature = await FeatureForm.findOne({
    _id: featureId,
    client_id: userId,
  });

  if (!feature) {
    return {
      statusCode: 203,
      message: "Feature form not found",
    };
  }

  if (actorId) {
    const existingActor = feature.actors.id(actorId);

    if (!existingActor) {
      return {
        statusCode: 203,
        message: "Actor not found",
      };
    }

    Object.entries(payload).forEach(([key, value]) => {
      if (!["id", "nfa_feature_id", "actorId"].includes(key)) {
        existingActor[key] = value;
      }
    });
  } else {
    feature.actors.push(payload);
  }

  await feature.save();

  return {
    statusCode: 200,
    message: actorId
      ? "Actor updated successfully"
      : "Actor added successfully",
    data: mapActors(feature.actors),
  };
};

export const deleteActorByIdService = async ({
  featureId,
  actorId,
  userId,
}) => {
  const feature = await FeatureForm.findOne({
    _id: featureId,
    client_id: userId,
  });

  if (!feature) {
    return {
      statusCode: 203,
      message: "Feature form not found",
    };
  }

  const actor = feature.actors.id(actorId);

  if (!actor) {
    return {
      statusCode: 203,
      message: "Actor not found",
    };
  }

  feature.actors.pull(actorId);
  await feature.save();

  return {
    statusCode: 200,
    message: "Actor deleted successfully",
  };
};