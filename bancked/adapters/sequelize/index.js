import { createRequire } from "node:module";
import { getDatabaseUrl } from "../../config/databaseProvider.js";
import {
  delegateNames,
  featureContributorRelations,
  featureContributorRelationFields,
} from "../shared/modelRegistry.js";
import { applySelect, stripUndefined, toPlainRecord } from "../shared/prismaShape.js";
import { createSequelizeModels } from "../../models/sequelize/index.js";

const require = createRequire(import.meta.url);
let SequelizePackage;
let sequelize;
let models;

const loadSequelize = () => {
  if (!SequelizePackage) {
    try {
      SequelizePackage = require("sequelize");
    } catch {
      throw new Error("ORM_PROVIDER=sequelize requires sequelize and a dialect driver, for example: npm install sequelize mysql2.");
    }
  }

  return SequelizePackage;
};

const getSequelize = () => {
  if (sequelize) return sequelize;

  const { Sequelize } = loadSequelize();
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error("DATABASE_URL is required for ORM_PROVIDER=sequelize");

  sequelize = new Sequelize(databaseUrl, {
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  });

  return sequelize;
};

const getModels = () => {
  if (models) return models;

  const sequelizeClient = getSequelize();
  const { DataTypes } = loadSequelize();
  models = createSequelizeModels(sequelizeClient, DataTypes);

  return models;
};

const mapWhere = (where = {}) => {
  const { Op } = loadSequelize();
  const mapped = {};

  for (const [field, value] of Object.entries(stripUndefined(where))) {
    if (featureContributorRelationFields.includes(field)) continue;
    if (field === "context_id_form_type_document_type_website_type" && value && typeof value === "object") {
      Object.assign(mapped, mapWhere(value));
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if ("in" in value) mapped[field] = { [Op.in]: value.in };
      else if ("gt" in value) mapped[field] = { [Op.gt]: value.gt };
      else mapped[field] = mapWhere(value);
    } else {
      mapped[field] = value;
    }
  }

  return mapped;
};

const findOneWithRelationFilter = async (Model, where = {}) => {
  const relationEntry = featureContributorRelationFields
    .map((relation) => [relation, where[relation]])
    .find(([, value]) => value?.some?.id);

  if (!relationEntry) return Model.findOne({ where: mapWhere(where), raw: true });

  const [relation, value] = relationEntry;
  const contributor = await getModels()[featureContributorRelations[relation]].findOne({
    where: { id: value.some.id },
    raw: true,
  });

  if (!contributor?.featureFormId) return null;
  return Model.findOne({
    where: { ...mapWhere(where), id: contributor.featureFormId },
    raw: true,
  });
};

const includeFeatureRelations = async (record, include = {}) => {
  if (!record || !include) return record;

  const activeRelations = featureContributorRelationFields.filter((relation) => include[relation]);
  if (!activeRelations.length) return record;

  const allModels = getModels();
  const enriched = { ...record };

  await Promise.all(
    activeRelations.map(async (relation) => {
      const rows = await allModels[featureContributorRelations[relation]].findAll({
        where: { featureFormId: record.id },
        raw: true,
      });
      enriched[relation] = rows;
    })
  );

  return enriched;
};

const createDelegate = (delegateName) => ({
  create: async ({ data }) => toPlainRecord(await getModels()[delegateName].create(stripUndefined(data))),

  findUnique: async ({ where = {}, select, include } = {}) => {
    const record = await getModels()[delegateName].findOne({ where: mapWhere(where), raw: true });
    return applySelect(await includeFeatureRelations(record, include), select);
  },

  findFirst: async ({ where = {}, select, include } = {}) => {
    const record = await findOneWithRelationFilter(getModels()[delegateName], where);
    return applySelect(await includeFeatureRelations(record, include), select);
  },

  findMany: async ({ where = {}, select, include } = {}) => {
    const records = await getModels()[delegateName].findAll({ where: mapWhere(where), raw: true });
    return Promise.all(records.map(async (record) => applySelect(await includeFeatureRelations(record, include), select)));
  },

  update: async ({ where = {}, data, select, include } = {}) => {
    await getModels()[delegateName].update(stripUndefined(data), { where: mapWhere(where) });
    const record = await getModels()[delegateName].findOne({ where: mapWhere(where), raw: true });
    return applySelect(await includeFeatureRelations(record, include), select);
  },

  delete: async ({ where = {} } = {}) => {
    const record = await getModels()[delegateName].findOne({ where: mapWhere(where), raw: true });
    await getModels()[delegateName].destroy({ where: mapWhere(where) });
    return record;
  },

  upsert: async ({ where = {}, create = {}, update = {} } = {}) => {
    const existing = await getModels()[delegateName].findOne({ where: mapWhere(where) });
    if (existing) {
      await existing.update(stripUndefined(update));
      return existing.toJSON();
    }

    return toPlainRecord(await getModels()[delegateName].create(stripUndefined({ ...where, ...create })));
  },
});

export const sequelizeAdapter = Object.fromEntries(
  delegateNames.map((delegateName) => [delegateName, createDelegate(delegateName)])
);

export const connect = async () => {
  await getSequelize().authenticate();
  getModels();
};

export const disconnect = async () => {
  if (sequelize) await sequelize.close();
};

export default sequelizeAdapter;
