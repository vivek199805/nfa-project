import { describe, expect, it } from "vitest";
import { countWords, formatDate } from "./common-function";

describe("common-function helpers", () => {
  describe("countWords", () => {
    it("returns 0 for empty or missing text", () => {
      expect(countWords()).toBe(0);
      expect(countWords("")).toBe(0);
      expect(countWords("   ")).toBe(0);
    });

    it("counts words separated by mixed whitespace", () => {
      expect(countWords("National Film Awards")).toBe(3);
      expect(countWords("  one\ttwo\nthree  ")).toBe(3);
    });
  });

  describe("formatDate", () => {
    it("returns an empty string for a missing date", () => {
      expect(formatDate()).toBe("");
      expect(formatDate("")).toBe("");
    });

    it("formats ISO-compatible dates as yyyy-mm-dd", () => {
      expect(formatDate("2026-04-28T10:30:00.000Z")).toBe("2026-04-28");
    });
  });
});
