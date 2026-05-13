import BaseRepository from "./base.repository.js";
import { normalizeFeatureFormPayload } from "../helpers/prismaPayloadNormalizer.js";
import { withMongoId } from "./prisma.mapper.js";

const featureFormRepository = new BaseRepository("featureForm");

export const featureInclude = {
  producers: true,
  directors: true,
  actors: true,
  songs: true,
  audiographer: true,
};

export const createFeatureForm = (data) =>
  featureFormRepository.create(normalizeFeatureFormPayload(data));

export const findFeatureFormByIdForUser = (id, userId, include = {}) =>
  featureFormRepository.findFirst({
    id,
    client_id: userId,
  }, {
    include,
  });

export const findFeatureFormsByUser = (userId, include = featureInclude) =>
  featureFormRepository.findMany({
    client_id: userId,
  }, {
    include,
  });

export const findNonFeatureFormsByUser = (userId, include = featureInclude) =>
  featureFormRepository.findMany({
    film_type: "non-feature",
    client_id: userId,
  }, {
    include,
  });

export const updateFeatureFormByIdForUser = async (id, userId, data, include = {}) => {
  const existing = await findFeatureFormByIdForUser(id, userId);
  if (!existing) return null;

  return featureFormRepository.updateById(id, normalizeFeatureFormPayload(data), {
    include,
  });
};

export const featureFormExistsByContributor = async ({ contributorType, contributorId, userId }) => {
  const relationWhere = {
    producers: { some: { id: contributorId } },
    directors: { some: { id: contributorId } },
  }[contributorType];

  if (!relationWhere) return false;

  const owner = await featureFormRepository.findFirst(
    {
      client_id: userId,
      ...relationWhere,
    },
    {
      select: { id: true },
    }
  );

  return Boolean(owner);
};

export const mapFeatureForResponse = (record) => {
  const mapped = withMongoId(record);
  if (!mapped) return mapped;

  return {
    ...mapped,
    producers: mapped.producers || [],
    directors: mapped.directors || [],
    actors: mapped.actors || [],
    songs: mapped.songs || [],
    audiographer: mapped.audiographer || [],
  };
};
