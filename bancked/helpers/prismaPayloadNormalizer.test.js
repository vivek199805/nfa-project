import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFeatureFormPayload } from "./prismaPayloadNormalizer.js";

test("normalizeFeatureFormPayload converts numeric string step fields", () => {
  assert.deepEqual(
    normalizeFeatureFormPayload({
      step: "1",
      active_step: "2",
    }),
    {
      step: 1,
      active_step: 2,
    }
  );
});

test("normalizeFeatureFormPayload converts empty date strings to null and valid dates to Date", () => {
  const result = normalizeFeatureFormPayload({
    censor_certificate_date: "",
    payment_date: "2026-05-12",
  });

  assert.equal(result.censor_certificate_date, null);
  assert.ok(result.payment_date instanceof Date);
  assert.equal(result.payment_date.toISOString().startsWith("2026-05-12"), true);
});

test("normalizeFeatureFormPayload converts boolean-like values only for boolean fields", () => {
  assert.deepEqual(
    normalizeFeatureFormPayload({
      work_under_public_domain: "true",
      shot_digital_video_format: "0",
      declaration_one: "1",
      english_subtitle: "1",
    }),
    {
      work_under_public_domain: true,
      shot_digital_video_format: false,
      declaration_one: true,
      english_subtitle: "1",
    }
  );
});

test("normalizeFeatureFormPayload converts comma-separated language ids to string arrays", () => {
  assert.deepEqual(
    normalizeFeatureFormPayload({
      language_id: "1, 2,3",
    }),
    {
      language_id: ["1", "2", "3"],
    }
  );
});

test("normalizeFeatureFormPayload maps legacy screenplay aliases to Prisma fields", () => {
  assert.deepEqual(
    normalizeFeatureFormPayload({
      effectsCreater: "Special effects name",
    }),
    {
      special_effect_creator: "Special effects name",
    }
  );
});

test("normalizeFeatureFormPayload removes frontend-only fields before Prisma writes", () => {
  assert.deepEqual(
    normalizeFeatureFormPayload({
      id: "feature-id",
      _id: "feature-id",
      files: [],
      producers: [],
      film_title_roman: "Film title",
    }),
    {
      film_title_roman: "Film title",
    }
  );
});
