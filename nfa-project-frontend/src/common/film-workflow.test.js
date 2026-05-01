import { describe, expect, it } from "vitest";
import {
  filmFinalSubmitEndpoint,
  getFilmCreateEndpoint,
  getFilmEntryByEndpoint,
  getFilmNextSection,
  getFilmPaymentDescription,
  getFilmPaymentFormType,
  getFilmPreviousSection,
  getFilmSectionStep,
  getFilmUpdateEndpoint,
} from "./film-workflow";

describe("film workflow endpoints", () => {
  it("returns feature film endpoints for feature workflow", () => {
    expect(getFilmEntryByEndpoint("feature")).toBe("film/feature-entry-by");
    expect(getFilmUpdateEndpoint("feature")).toBe("film/feature-update");
    expect(getFilmCreateEndpoint("feature")).toBe("film/feature-create");
  });

  it("returns non-feature endpoints for non-feature workflow", () => {
    expect(getFilmEntryByEndpoint("non-feature")).toBe(
      "film/non-feature-entry-by",
    );
    expect(getFilmUpdateEndpoint("non-feature")).toBe(
      "film/non-feature-update",
    );
    expect(getFilmCreateEndpoint("non-feature")).toBe(
      "film/non-feature-create",
    );
  });

  it("keeps final submit endpoint stable", () => {
    expect(filmFinalSubmitEndpoint).toBe("film/final-submit");
  });
});

describe("film workflow steps", () => {
  it("keeps shared initial film steps stable", () => {
    expect(getFilmSectionStep("feature", "details")).toBe("1");
    expect(getFilmNextSection("feature", "details")).toBe(2);
    expect(getFilmSectionStep("feature", "censor")).toBe("2");
    expect(getFilmPreviousSection("feature", "censor")).toBe(1);
    expect(getFilmNextSection("feature", "censor")).toBe(3);
    expect(getFilmSectionStep("feature", "company")).toBe("3");
    expect(getFilmPreviousSection("feature", "company")).toBe(2);
    expect(getFilmNextSection("feature", "company")).toBe(4);
    expect(getFilmSectionStep("feature", "producer")).toBe("4");
    expect(getFilmPreviousSection("feature", "producer")).toBe(3);
    expect(getFilmNextSection("feature", "producer")).toBe(5);
    expect(getFilmSectionStep("feature", "director")).toBe("5");
    expect(getFilmPreviousSection("feature", "director")).toBe(4);
    expect(getFilmNextSection("feature", "director")).toBe(6);
  });

  it("keeps feature-only film steps stable", () => {
    expect(getFilmSectionStep("feature", "actor")).toBe("6");
    expect(getFilmPreviousSection("feature", "actor")).toBe(5);
    expect(getFilmNextSection("feature", "actor")).toBe(7);
    expect(getFilmSectionStep("feature", "songs")).toBe("7");
    expect(getFilmPreviousSection("feature", "songs")).toBe(6);
    expect(getFilmNextSection("feature", "songs")).toBe(8);
    expect(getFilmSectionStep("feature", "audiographer")).toBe("8");
    expect(getFilmPreviousSection("feature", "audiographer")).toBe(7);
    expect(getFilmNextSection("feature", "audiographer")).toBe(9);
    expect(getFilmSectionStep("feature", "screenplay")).toBe("9");
    expect(getFilmPreviousSection("feature", "screenplay")).toBe(8);
    expect(getFilmNextSection("feature", "screenplay")).toBe(10);
  });

  it("keeps non-feature-only film steps stable", () => {
    expect(getFilmSectionStep("non-feature", "other")).toBe("6");
    expect(getFilmPreviousSection("non-feature", "other")).toBe(5);
    expect(getFilmNextSection("non-feature", "other")).toBe(7);
    expect(getFilmPreviousSection("non-feature", "view")).toBe(7);
    expect(getFilmNextSection("non-feature", "view")).toBe(9);
  });

  it("keeps feature shared-section steps stable", () => {
    expect(getFilmSectionStep("feature", "return")).toBe("10");
    expect(getFilmPreviousSection("feature", "return")).toBe(9);
    expect(getFilmNextSection("feature", "return")).toBe(11);
    expect(getFilmSectionStep("feature", "declaration")).toBe("11");
    expect(getFilmPreviousSection("feature", "declaration")).toBe(10);
    expect(getFilmNextSection("feature", "declaration")).toBe(12);
    expect(getFilmPreviousSection("feature", "payment")).toBe(11);
  });

  it("keeps non-feature shared-section steps stable", () => {
    expect(getFilmSectionStep("non-feature", "return")).toBe("7");
    expect(getFilmPreviousSection("non-feature", "return")).toBe(6);
    expect(getFilmNextSection("non-feature", "return")).toBe(8);
    expect(getFilmSectionStep("non-feature", "declaration")).toBe("9");
    expect(getFilmPreviousSection("non-feature", "declaration")).toBe(8);
    expect(getFilmNextSection("non-feature", "declaration")).toBe(10);
    expect(getFilmPreviousSection("non-feature", "payment")).toBe(9);
  });
});

describe("film payment metadata", () => {
  it("keeps feature and non-feature payment payload metadata stable", () => {
    expect(getFilmPaymentFormType("feature")).toBe("FEATURE");
    expect(getFilmPaymentDescription("feature")).toBe(
      "Feature Film Registration Payment",
    );
    expect(getFilmPaymentFormType("non-feature")).toBe("NON_FEATURE");
    expect(getFilmPaymentDescription("non-feature")).toBe(
      "Non Feature Film Registration Payment",
    );
  });
});
