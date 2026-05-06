import { describe, expect, it } from "vitest";
import {
  isPublicApiEndpoint,
  apiConfig,
} from "./apiEndpoints";

describe("api endpoint metadata", () => {
  it("keeps auth endpoint paths aligned with the backend route contract", () => {
    expect(apiConfig.auth).toEqual({
      login: "user/login",
      register: "user/register",
      verifyEmail: "user/verify-email",
      forgotPassword: "user/forgot-password",
      verifyOtp: "user/verify-otp",
      resendOtp: "user/resend-otp",
      resetPassword: "user/reset-password",
      changePassword: "user/change-password",
    });
  });

  it("keeps shared service endpoints unchanged", () => {
    expect(apiConfig.common.languages).toBe("get-languages");
    expect(apiConfig.dashboard.entryList).toBe("/entry-list");
    expect(apiConfig.payment).toEqual({
      order: "payment/order",
      verify: "payment/verify",
    });
    expect(apiConfig.awardChild).toEqual({
      book: {
        list: "list-book",
        store: "store-book",
        update: "update-book",
        delete: "delete-book",
      },
      editor: {
        list: "list-editor",
        store: "store-editor",
        update: "update-editor",
        delete: "delete-editor",
      },
    });
    expect(apiConfig.filmCritic).toEqual({
      entryBy: "best-film-critic-entry-by",
      create: "create-entry",
      update: "update-entry",
      finalSubmit: "best-film-critic-final-submit",
    });
    expect(apiConfig.bestBook).toEqual({
      entryBy: "best-book-cinema-entry-by",
      create: "best-book-cinema-entry",
      update: "best-book-cinema-update",
      finalSubmit: "best-book-cinema-final-submit",
    });
    expect(apiConfig.filmChild).toEqual({
      producer: {
        list: "film/producer-list",
        store: "film/store-producer",
        delete: "film/delete-producer",
      },
      director: {
        list: "film/director-list",
        store: "film/store-director",
        delete: "film/delete-director",
      },
      actor: {
        list: "film/actor-list",
        store: "film/store-actor",
        delete: "film/delete-actor",
      },
      song: {
        list: "film/song-list",
        store: "film/store-song",
        delete: "film/delete-song",
      },
      audiographer: {
        list: "film/audiographer-list",
        store: "film/store-audiographer",
        delete: "film/delete-audiographer",
      },
    });
  });

  it("keeps award entry endpoint paths aligned with the backend route contract", () => {
    expect(apiConfig.filmCritic).toEqual({
      entryBy: "best-film-critic-entry-by",
      create: "create-entry",
      update: "update-entry",
      finalSubmit: "best-film-critic-final-submit",
    });

    expect(apiConfig.bestBook).toEqual({
      entryBy: "best-book-cinema-entry-by",
      create: "best-book-cinema-entry",
      update: "best-book-cinema-update",
      finalSubmit: "best-book-cinema-final-submit",
    });
  });

  it("matches the existing public auth route suffix behavior", () => {
    expect(isPublicApiEndpoint("user/login")).toBe(true);
    expect(isPublicApiEndpoint("user/register")).toBe(true);
    expect(isPublicApiEndpoint("user/forgot-password")).toBe(true);
    expect(isPublicApiEndpoint("user/reset-password")).toBe(true);
    expect(isPublicApiEndpoint("user/verify-email")).toBe(true);
    expect(isPublicApiEndpoint("user/change-password")).toBe(false);
    expect(isPublicApiEndpoint("film/feature-create")).toBe(false);
  });
});
