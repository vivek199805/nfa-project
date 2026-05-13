import test from "node:test";
import assert from "node:assert/strict";
import {
  getInvalidNumericFields,
  normalizeContributorPayload,
} from "./featureContributor.repository.js";

test("normalizeContributorPayload converts producer integer fields before Prisma writes", () => {
  assert.deepEqual(
    normalizeContributorPayload({
      contributorType: "producers",
      data: {
        indian_national: "1",
        receive_producer_award: "0",
        name: "Producer name",
      },
    }),
    {
      indian_national: 1,
      receive_producer_award: 0,
      name: "Producer name",
    }
  );
});

test("getInvalidNumericFields rejects non-integer contributor numeric fields", () => {
  assert.deepEqual(
    getInvalidNumericFields({
      contributorType: "producers",
      data: {
        indian_national: "abc",
        receive_producer_award: "1.5",
      },
    }),
    {
      indian_national: "indian_national must be a valid integer.",
      receive_producer_award: "receive_producer_award must be a valid integer.",
    }
  );
});

test("normalizeContributorPayload only keeps writable fields for the active contributor type", () => {
  assert.deepEqual(
    normalizeContributorPayload({
      contributorType: "actors",
      data: {
        actor_category_id: "2",
        indian_national: "1",
      },
    }),
    {
      actor_category_id: 2,
    }
  );
});

test("normalizeContributorPayload removes route-only fields before Prisma writes", () => {
  assert.deepEqual(
    normalizeContributorPayload({
      contributorType: "producers",
      data: {
        id: "producer-id",
        film_type: "feature",
        indian_national: "1",
        name: "Producer name",
      },
    }),
    {
      indian_national: 1,
      name: "Producer name",
    }
  );
});
