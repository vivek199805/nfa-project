import { describe, expect, it } from "vitest";
import { isProtectedDocumentPath, resolveDocumentUrl } from "./documentService";

describe("documentService", () => {
  it("recognizes authenticated backend document download routes", () => {
    expect(isProtectedDocumentPath("/api/documents/123/download")).toBe(true);
    expect(isProtectedDocumentPath("documents/NFA/file.pdf")).toBe(false);
  });

  it("preserves backend document download routes without duplicating the api prefix", () => {
    expect(resolveDocumentUrl("/api/documents/123/download")).toBe("documents/123/download");
  });

  it("keeps absolute urls unchanged and normalizes legacy relative file paths", () => {
    expect(resolveDocumentUrl("https://files.example.test/censor.pdf")).toBe(
      "https://files.example.test/censor.pdf"
    );
    expect(resolveDocumentUrl("documents/NFA/censor.pdf")).toContain("/documents/NFA/censor.pdf");
  });
});
