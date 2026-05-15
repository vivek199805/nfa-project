export const stripUndefined = (data = {}) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

export const toPlainRecord = (record) => {
  if (!record) return record;

  const plain = typeof record.toJSON === "function"
    ? record.toJSON()
    : typeof record.toObject === "function"
      ? record.toObject()
      : { ...record };

  if (plain._id && !plain.id) plain.id = String(plain._id);
  if (plain._id) plain._id = String(plain._id);

  return plain;
};

export const applySelect = (record, select) => {
  if (!record || !select) return record;

  return Object.fromEntries(
    Object.entries(select)
      .filter(([, enabled]) => enabled)
      .map(([field]) => [field, record[field]])
  );
};

export const matchesWhere = (record, where = {}) => {
  for (const [field, expected] of Object.entries(where)) {
    const actual = record?.[field];

    if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date)) {
      if ("in" in expected) {
        if (!expected.in.map(String).includes(String(actual))) return false;
        continue;
      }

      if ("gt" in expected) {
        if (!(actual > expected.gt)) return false;
        continue;
      }

      if ("some" in expected) continue;
    }

    if (String(actual) !== String(expected)) return false;
  }

  return true;
};
