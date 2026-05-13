import test from "node:test";
import assert from "node:assert/strict";
import { isRecordId } from "./validationCommon.js";

test("isRecordId accepts Mongo ObjectIds and UUIDs", () => {
  assert.equal(isRecordId("507f1f77bcf86cd799439011"), true);
  assert.equal(isRecordId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isRecordId("not-an-id"), false);
});
