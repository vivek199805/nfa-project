import { describe, expect, it } from "vitest";
import { getResumeStep } from "./entry-step";

describe("getResumeStep", () => {
  it("moves to the next step when the persisted active step is not final", () => {
    expect(getResumeStep(3, 12)).toBe(4);
    expect(getResumeStep("2", 5)).toBe(3);
  });

  it("stays on the final step when active step has reached or passed the end", () => {
    expect(getResumeStep(12, 12)).toBe(12);
    expect(getResumeStep(14, 12)).toBe(12);
  });

  it("preserves existing coercion behavior for edge values", () => {
    expect(getResumeStep(null, 5)).toBe(1);
    expect(getResumeStep("not-a-number", 5)).toBe(5);
  });
});
