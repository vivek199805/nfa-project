import { describe, expect, it } from "vitest";
import {
  bestBookWorkflow,
  filmCriticWorkflow,
  getAwardNextSection,
  getAwardPreviousSection,
  getAwardSectionStep,
} from "./award-workflow";

describe("award workflow payment metadata", () => {
  it("keeps best book payment metadata stable", () => {
    expect(bestBookWorkflow).toEqual({
      paymentFormType: "BEST_BOOK",
      paymentDescription: "Best Book on Cinema Registration Payment",
      previewPreviousSection: 4,
    });
  });

  it("keeps film critic payment metadata stable", () => {
    expect(filmCriticWorkflow).toEqual({
      paymentFormType: "BEST_FILM_CRITIC",
      paymentDescription: "Best Film Critic Registration Payment",
      previewPreviousSection: 4,
    });
  });
});

describe("award workflow steps", () => {
  it("keeps first-step values stable", () => {
    expect(getAwardSectionStep("first")).toBe(1);
    expect(getAwardNextSection("first")).toBe(2);
  });

  it("keeps detail-step values stable", () => {
    expect(getAwardSectionStep("detail")).toBe(2);
    expect(getAwardPreviousSection("detail")).toBe(1);
    expect(getAwardNextSection("detail")).toBe(3);
  });

  it("keeps publisher-step values stable", () => {
    expect(getAwardSectionStep("publisher")).toBe("3");
    expect(getAwardPreviousSection("publisher")).toBe(2);
    expect(getAwardNextSection("publisher")).toBe(4);
  });

  it("keeps declaration-step values stable", () => {
    expect(getAwardSectionStep("declaration")).toBe(4);
    expect(getAwardPreviousSection("declaration")).toBe(3);
    expect(getAwardNextSection("declaration")).toBe(5);
  });

  it("returns undefined for unknown award sections", () => {
    expect(getAwardSectionStep("missing")).toBeUndefined();
    expect(getAwardPreviousSection("missing")).toBeUndefined();
    expect(getAwardNextSection("missing")).toBeUndefined();
  });
});
