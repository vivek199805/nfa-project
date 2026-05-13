export const withMongoId = (record) => {
  if (!record) return record;
  return {
    ...record,
    _id: record.id,
  };
};

export const withMongoIds = (records = []) => records.map(withMongoId);

export const toPublicId = (record) => {
  if (!record) return record;
  const { id, _id, ...rest } = withMongoId(record);
  return {
    ...rest,
    id: id || _id,
  };
};

export const toPublicIds = (records = []) => records.map(toPublicId);

export const stripUndefined = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

export const normalizeId = (id) => {
  if (id === undefined || id === null) return "";
  return String(id);
};

const normalizeWhereValue = (value, provider) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeWhereValue(item, provider));
  }

  if (!value || typeof value !== "object" || value instanceof Date) {
    return value;
  }

  return normalizeWhere(value, provider);
};

export const normalizeWhere = (where = {}, provider = process.env.DB_PROVIDER || "mongodb") => {
  const normalized = {};

  for (const [key, value] of Object.entries(stripUndefined(where))) {
    if (key === "id" || key.endsWith("Id") || key.endsWith("_id") || key === "client_id") {
      if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        normalized[key] = normalizeWhereValue(value, provider);
      } else {
        normalized[key] = normalizeId(value, provider);
      }
      continue;
    }

    normalized[key] = normalizeWhereValue(value, provider);
  }

  return normalized;
};
