import assert from "node:assert/strict";
import test from "node:test";
import ActorController from "./actorController.js";
import AudiographerController from "./audiographerController.js";
import DirectorController from "./directorController.js";
import ProducerController from "./producerController.js";
import SongController from "./songController.js";

const makeResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const assertValidationResponse = (res, fieldName) => {
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.message, "Validation failed");
  assert.equal(res.body.statusCode, 422);
  assert.ok(res.body.errors[fieldName]);
};

test("actor list rejects operator-shaped feature ids before querying", async () => {
  const res = makeResponse();

  await ActorController.getAllActorsByFeatureId(
    {
      body: { id: { $ne: null } },
      user: { _id: "user-1" },
    },
    res
  );

  assertValidationResponse(res, "id");
});

test("producer store rejects invalid optional producer ids before querying", async () => {
  const res = makeResponse();

  await ProducerController.addProducerToFeature(
    {
      body: {
        nfa_feature_id: "507f1f77bcf86cd799439011",
        id: { $gt: "" },
      },
      files: [],
      user: { _id: "user-1" },
    },
    res
  );

  assertValidationResponse(res, "id");
});

test("director delete rejects missing child ids before querying", async () => {
  const res = makeResponse();

  await DirectorController.deleteDirectorById(
    {
      body: {
        nfa_feature_id: "507f1f77bcf86cd799439011",
      },
      user: { _id: "user-1" },
    },
    res
  );

  assertValidationResponse(res, "directorId");
});

test("song store rejects invalid optional child ids before querying", async () => {
  const res = makeResponse();

  await SongController.addSongToFeature(
    {
      body: {
        nfa_feature_id: "507f1f77bcf86cd799439011",
        songId: { $ne: null },
      },
      user: { _id: "user-1" },
    },
    res
  );

  assertValidationResponse(res, "songId");
});

test("audiographer delete rejects invalid parent ids before querying", async () => {
  const res = makeResponse();

  await AudiographerController.deleteAudiographerById(
    {
      body: {
        nfa_feature_id: { $ne: null },
        audiographerId: "507f1f77bcf86cd799439012",
      },
      user: { _id: "user-1" },
    },
    res
  );

  assertValidationResponse(res, "nfa_feature_id");
});
