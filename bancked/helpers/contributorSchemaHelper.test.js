import assert from "node:assert/strict";
import test from "node:test";
import { validateContributorPayload } from "./contributorSchemaHelper.js";

test("validateContributorPayload accepts required ObjectId and optional child id", () => {
  const result = validateContributorPayload(
    {
      nfa_feature_id: "507f1f77bcf86cd799439011",
      actorId: "507f1f77bcf86cd799439012",
      actor_name: "Existing contract data passes through",
    },
    {
      requiredIds: ["nfa_feature_id"],
      optionalIds: ["actorId"],
    }
  );

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test("validateContributorPayload accepts legacy numeric ids", () => {
  const result = validateContributorPayload(
    {
      id: 12,
      producerId: "34",
    },
    {
      requiredIds: ["id"],
      optionalIds: ["producerId"],
    }
  );

  assert.equal(result.isValid, true);
});

test("validateContributorPayload rejects missing required ids", () => {
  const result = validateContributorPayload(
    {},
    {
      requiredIds: ["nfa_feature_id"],
    }
  );

  assert.equal(result.isValid, false);
  assert.equal(
    result.errors.nfa_feature_id,
    "Invalid input"
  );
});

test("validateContributorPayload rejects NoSQL operator-shaped ids", () => {
  const result = validateContributorPayload(
    {
      id: { $ne: null },
    },
    {
      requiredIds: ["id"],
    }
  );

  assert.equal(result.isValid, false);
  assert.equal(result.errors.id, "Invalid input");
});
