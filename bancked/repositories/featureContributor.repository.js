import BaseRepository from "./base.repository.js";
import { stripUndefined } from "./prisma.mapper.js";

const featureFormRepository = new BaseRepository("featureForm");

const modelByType = {
  producers: "featureProducer",
  directors: "featureDirector",
  actors: "featureActor",
  songs: "featureSong",
  audiographer: "featureAudiographer",
};

const relationByType = {
  producers: "producers",
  directors: "directors",
  actors: "actors",
  songs: "songs",
  audiographer: "audiographer",
};

const numericFieldsByType = {
  producers: ["indian_national", "receive_producer_award"],
  actors: ["actor_category_id"],
};

const writableFieldsByType = {
  producers: [
    "address",
    "contact_nom",
    "country_of_nationality",
    "name",
    "email",
    "pincode",
    "nfa_feature_id",
    "producer_self_attested_doc",
    "indian_national",
    "receive_producer_award",
    "production_company",
    "client_id",
    "featureFormId",
  ],
  directors: [
    "client_id",
    "nfa_feature_id",
    "name",
    "email",
    "contact_nom",
    "address",
    "pincode",
    "director_self_attested_doc",
    "receive_director_award",
    "indian_national",
    "country_of_nationality",
    "production_company",
    "featureFormId",
  ],
  actors: [
    "client_id",
    "nfa_feature_id",
    "actor_category_id",
    "name",
    "screen_name",
    "if_voice_dubbed",
    "featureFormId",
  ],
  songs: [
    "client_id",
    "nfa_feature_id",
    "song_title",
    "music_director",
    "music_director_bkgd_music",
    "lyricist",
    "playback_singer_male",
    "playback_singer_female",
    "featureFormId",
  ],
  audiographer: [
    "client_id",
    "nfa_feature_id",
    "production_sound_recordist",
    "sound_designer",
    "re_recordist_filnal",
    "featureFormId",
  ],
};

const toOptionalNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  if (typeof value === "string") return null;
  return value;
};

export const getInvalidNumericFields = ({ contributorType, data = {} }) => {
  const errors = {};

  for (const field of numericFieldsByType[contributorType] || []) {
    const value = data[field];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "string" && value.trim() === "") continue;

    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(numericValue)) {
      errors[field] = `${field} must be a valid integer.`;
    }
  }

  return errors;
};

export const normalizeContributorPayload = ({ contributorType, data = {} }) => {
  const writableFields = writableFieldsByType[contributorType] || Object.keys(data);
  const normalized = Object.fromEntries(
    writableFields
      .filter((field) => Object.prototype.hasOwnProperty.call(data, field))
      .map((field) => [field, data[field]])
  );

  for (const field of numericFieldsByType[contributorType] || []) {
    if (Object.prototype.hasOwnProperty.call(normalized, field)) {
      normalized[field] = toOptionalNumber(normalized[field]);
    }
  }

  return stripUndefined(normalized);
};

export const findFeatureWithContributors = ({ featureId, userId, contributorType }) =>
  featureFormRepository.findFirst({
    id: featureId,
    client_id: userId,
  }, {
    include: { [relationByType[contributorType]]: true },
  });

export const findContributorById = ({ contributorType, contributorId, featureId }) =>
  new BaseRepository(modelByType[contributorType]).findFirst({
    id: contributorId,
    featureFormId: featureId,
  });

export const createContributor = ({ contributorType, featureId, userId, data }) => {
  const normalizedData = normalizeContributorPayload({
    contributorType,
    data: {
      ...data,
      client_id: String(userId),
      featureFormId: featureId,
      nfa_feature_id: data.nfa_feature_id || featureId,
    },
  });

  return new BaseRepository(modelByType[contributorType]).create(normalizedData);
};

export const updateContributor = ({ contributorType, contributorId, data }) =>
  new BaseRepository(modelByType[contributorType]).updateById(
    contributorId,
    normalizeContributorPayload({ contributorType, data })
  );

export const deleteContributor = ({ contributorType, contributorId }) =>
  new BaseRepository(modelByType[contributorType]).deleteById(contributorId);

export const listContributors = async ({ contributorType, featureId, userId }) => {
  const feature = await findFeatureWithContributors({ featureId, userId, contributorType });
  return feature?.[relationByType[contributorType]] || null;
};
