import { describe, expect, it } from "vitest";
import {
  entryWorkflowTypes,
  getDashboardEntryPath,
  getEntryWorkflowMeta,
  resolveViewWorkflowFromPath,
} from "./entry-workflow";
import { apiConfig } from "../services/apiEndpoints";

describe("entry workflow metadata", () => {
  it("keeps dashboard workflow ordering stable", () => {
    expect(entryWorkflowTypes).toEqual([
      "feature",
      "non-feature",
      "bestBooks",
      "bestFilmCritic",
    ]);
  });

  it("keeps dashboard labels and routes stable", () => {
    expect(getEntryWorkflowMeta("feature")).toMatchObject({
      label: "Feature",
      route: "feature",
    });
    expect(getEntryWorkflowMeta("non-feature")).toMatchObject({
      label: "Non-Feature",
      route: "non-feature",
    });
    expect(getEntryWorkflowMeta("bestBooks")).toMatchObject({
      label: "Best Book on Cinema",
      route: "best-book",
    });
    expect(getEntryWorkflowMeta("bestFilmCritic")).toMatchObject({
      label: "Best Critic on Cinema",
      route: "film-critic",
    });
  });

  it("builds edit and paid view paths without changing route names", () => {
    expect(getDashboardEntryPath("feature", "abc", false)).toBe("/feature/abc");
    expect(getDashboardEntryPath("feature", "abc", true)).toBe(
      "/feature/view/abc",
    );
    expect(getDashboardEntryPath("bestBooks", "book-id", false)).toBe(
      "/best-book/book-id",
    );
    expect(getDashboardEntryPath("bestFilmCritic", "critic-id", true)).toBe(
      "/film-critic/view/critic-id",
    );
  });

  it("resolves view endpoint metadata from existing paths", () => {
    expect(resolveViewWorkflowFromPath("/best-book/view/1")).toMatchObject({
      entryBy: "best-book-cinema-entry-by",
      viewType: "best-book",
    });
    expect(resolveViewWorkflowFromPath("/film-critic/view/1")).toMatchObject({
      entryBy: "best-film-critic-entry-by",
      viewType: "film-critic",
    });
    expect(resolveViewWorkflowFromPath("/non-feature/view/1")).toMatchObject({
      entryBy: "film/non-feature-entry-by",
      viewType: "non-feature",
    });
    expect(resolveViewWorkflowFromPath("/feature/view/1")).toMatchObject({
      entryBy: "film/feature-entry-by",
      viewType: "feature",
    });
  });

  it("uses apiConfig award endpoints for award entry metadata", () => {
    expect(getEntryWorkflowMeta("bestBooks").entryBy).toBe(
      apiConfig.bestBook.entryBy,
    );
    expect(getEntryWorkflowMeta("bestFilmCritic").entryBy).toBe(
      apiConfig.filmCritic.entryBy,
    );
  });
});
