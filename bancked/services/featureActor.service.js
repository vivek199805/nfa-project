import {
  createContributor,
  deleteContributor,
  findContributorById,
  findFeatureWithContributors,
  listContributors,
  updateContributor,
} from "../repositories/featureContributor.repository.js";
import { toPublicIds } from "../repositories/prisma.mapper.js";

export const getActorsByFeatureIdService = async ({ featureId, userId }) => {
  const actors = await listContributors({
    contributorType: "actors",
    featureId,
    userId,
  });

  if (!actors) {
    return {
      statusCode: 203,
      message: "Records not found",
    };
  }

  return {
    statusCode: 200,
    message: "Data fetched successfully",
    data: actors,
  };
};

export const saveActorToFeatureService = async (
  { featureId, actorId, userId, payload }
) => {
  const feature = await findFeatureWithContributors({
    contributorType: "actors",
    featureId,
    userId,
  });

  if (!feature) {
    return {
      statusCode: 203,
      message: "Feature form not found",
    };
  }

  if (actorId) {
    const existingActor = await findContributorById({
      contributorType: "actors",
      contributorId: actorId,
      featureId,
    });

    if (!existingActor) {
      return {
        statusCode: 203,
        message: "Actor not found",
      };
    }

    const updateData = Object.fromEntries(
      Object.entries(payload).filter(([key]) => !["id", "nfa_feature_id", "actorId"].includes(key))
    );
    await updateContributor({
      contributorType: "actors",
      contributorId: actorId,
      data: { ...updateData, if_voice_dubbed: [1, "1"].includes(updateData.if_voice_dubbed) },
    });
  } else {
    await createContributor({
      contributorType: "actors",
      featureId,
      userId,
      data: { ...payload, if_voice_dubbed: [1, "1"].includes(payload.if_voice_dubbed) },
    });
  }

  const actors = await listContributors({
    contributorType: "actors",
    featureId,
    userId,
  });

  return {
    statusCode: 200,
    message: actorId ? "Actor updated successfully" : "Actor added successfully",
    data: toPublicIds(actors),
  };
};

export const deleteActorByIdService = async (
  { featureId, actorId, userId }
) => {
  const feature = await findFeatureWithContributors({
    contributorType: "actors",
    featureId,
    userId,
  });

  if (!feature) {
    return {
      statusCode: 203,
      message: "Feature form not found",
    };
  }

  const actor = await findContributorById({
    contributorType: "actors",
    contributorId: actorId,
    featureId,
  });

  if (!actor) {
    return {
      statusCode: 203,
      message: "Actor not found",
    };
  }

  await deleteContributor({
    contributorType: "actors",
    contributorId: actorId,
  });

  return {
    statusCode: 200,
    message: "Actor deleted successfully",
  };
};
