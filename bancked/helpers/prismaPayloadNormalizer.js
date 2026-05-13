import { stripUndefined } from "../repositories/prisma.mapper.js";

const toNumberOrOriginal = (value) => {
  if (value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
  }
  return value;
};

const toBooleanOrOriginal = (value) => {
  if (value === true || value === false) return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return value;
};

const toDateOrNull = (value) => {
  if (value === "" || value === null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? value : dateValue;
  }
  return value;
};

const toStringArray = (value) => {
  if (value === "" || value === null) return [];
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") {
        return item.includes(",")
          ? item.split(",").map((part) => part.trim()).filter(Boolean)
          : [item];
      }
      if (item && typeof item === "object" && "value" in item) return [String(item.value)];
      return item == null ? [] : [String(item)];
    });
  }
  return value;
};

const toJsonOrNull = (value) => {
  if (value === "" || value === null) return null;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const normalizePrismaPayload = (payload = {}, fieldTypes = {}) => {
  const normalized = {};

  for (const [field, value] of Object.entries(payload)) {
    const fieldType = fieldTypes[field];

    if (!fieldType) {
      normalized[field] = value;
      continue;
    }

    if (fieldType === "int") normalized[field] = toNumberOrOriginal(value);
    else if (fieldType === "boolean") normalized[field] = toBooleanOrOriginal(value);
    else if (fieldType === "date") normalized[field] = toDateOrNull(value);
    else if (fieldType === "stringArray") normalized[field] = toStringArray(value);
    else if (fieldType === "json") normalized[field] = toJsonOrNull(value);
    else normalized[field] = value;
  }

  return stripUndefined(normalized);
};

const featureFormAliases = {
  effectsCreater: "special_effect_creator",
};

const featureFormFieldTypes = {
  step: "int",
  active_step: "int",
  language_id: "stringArray",
  censor_certificate_date: "date",
  payment_date: "date",
  work_under_public_domain: "boolean",
  shot_digital_video_format: "boolean",
  declaration_one: "boolean",
  declaration_two: "boolean",
  declaration_three: "boolean",
  declaration_four: "boolean",
  declaration_five: "boolean",
  declaration_six: "boolean",
  declaration_seven: "boolean",
  declaration_eight: "boolean",
  declaration_nine: "boolean",
  declaration_ten: "boolean",
  declaration_eleven: "boolean",
  declaration_twelve: "boolean",
  payment_response: "json",
};

const featureFormWritableFields = new Set([
  "step",
  "film_type",
  "active_step",
  "payment_status",
  "status",
  "client_id",
  "film_title_roman",
  "film_title_devnagri",
  "film_title_english",
  "language_id",
  "english_subtitle",
  "director_debut",
  "nom_reels_tapes",
  "aspect_ratio",
  "format",
  "sound_system",
  "running_time",
  "color_bw",
  "film_synopsis",
  "censor_certificate_nom",
  "censor_certificate_date",
  "censor_certificate_file",
  "title_registratin_detils",
  "payment_date",
  "amount",
  "reference_number",
  "receipt",
  "company_reg_details",
  "company_reg_doc",
  "original_screenplay_name",
  "adapted_screenplay_name",
  "story_writer_name",
  "work_under_public_domain",
  "original_work_copy",
  "dialogue",
  "cinemetographer",
  "editor",
  "costume_designer",
  "animator",
  "vfx_supervisor",
  "stunt_choreographer",
  "music_director",
  "special_effect_creator",
  "shot_digital_video_format",
  "production_designer",
  "make_up_director",
  "choreographer",
  "return_name",
  "return_mobile",
  "return_address",
  "return_fax",
  "return_email",
  "return_pincode",
  "return_website",
  "declaration_one",
  "declaration_two",
  "declaration_three",
  "declaration_four",
  "declaration_five",
  "declaration_six",
  "declaration_seven",
  "declaration_eight",
  "declaration_nine",
  "declaration_ten",
  "declaration_eleven",
  "declaration_twelve",
  "non_audiographer",
  "payment_response",
]);

const mapFeatureFormAliases = (payload = {}) => {
  const mapped = { ...payload };

  for (const [alias, field] of Object.entries(featureFormAliases)) {
    if (
      Object.prototype.hasOwnProperty.call(mapped, alias) &&
      !Object.prototype.hasOwnProperty.call(mapped, field)
    ) {
      mapped[field] = mapped[alias];
    }
  }

  return mapped;
};

const pickFeatureFormWritableFields = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(([field]) => featureFormWritableFields.has(field))
  );

export const normalizeFeatureFormPayload = (payload = {}) =>
  normalizePrismaPayload(
    pickFeatureFormWritableFields(mapFeatureFormAliases(payload)),
    featureFormFieldTypes
  );
