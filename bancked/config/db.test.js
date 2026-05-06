import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import "./db.js";

test("database config enables global Mongoose filter sanitization", () => {
  assert.equal(mongoose.get("strictQuery"), true);
  assert.equal(mongoose.get("sanitizeFilter"), true);
});
