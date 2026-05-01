import test from "node:test";
import assert from "node:assert/strict";
import {
  formType,
  stepsBestBook,
  stepsBestFilmCritic,
  stepsFeature,
  stepsNonFeature,
  websiteType,
} from "./common.js";

test("feature film step constants preserve the existing workflow order", () => {
  assert.deepEqual(stepsFeature(), {
    GENERAL: 1,
    CENSOR: 2,
    COMPANY_REGISTRATION: 3,
    PRODUCER: 4,
    DIRECTOR: 5,
    ACTORS: 6,
    SONGS: 7,
    AUDIOGRAPHER: 8,
    OTHER: 9,
    RETURN_ADDRESS: 10,
    DECLARATION: 11,
    FINAL_SUBMIT: 12,
  });
});

test("non-feature film step constants preserve the existing workflow order", () => {
  assert.equal(stepsNonFeature().VIEW, 8);
  assert.equal(stepsNonFeature().FINAL_SUBMIT, 10);
});

test("award step constants preserve final submit values", () => {
  assert.equal(stepsBestBook().FINAL_SUBMIT, 5);
  assert.equal(stepsBestFilmCritic().FINAL_SUBMIT, 5);
});

test("form and website type constants preserve persisted numeric values", () => {
  assert.equal(formType.FEATURE, 1);
  assert.equal(formType.BEST_FILM_CRITIC, 4);
  assert.equal(websiteType.NFA, 5);
});
