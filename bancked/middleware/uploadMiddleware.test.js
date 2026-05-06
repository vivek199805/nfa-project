import test from "node:test";
import assert from "node:assert/strict";
import { fileFilter, isAllowedUploadFile } from "./uploadMiddleware.js";

test("upload file validation accepts allowed extension and MIME pairs", () => {
  assert.equal(
    isAllowedUploadFile({
      originalname: "certificate.PDF",
      mimetype: "application/pdf",
    }),
    true,
  );

  assert.equal(
    isAllowedUploadFile({
      originalname: "poster.jpeg",
      mimetype: "image/jpeg",
    }),
    true,
  );
});

test("upload file validation rejects unsupported extensions or MIME types", () => {
  assert.equal(
    isAllowedUploadFile({
      originalname: "script.exe",
      mimetype: "image/png",
    }),
    false,
  );

  assert.equal(
    isAllowedUploadFile({
      originalname: "poster.png",
      mimetype: "image/svg+xml",
    }),
    false,
  );
});

test("fileFilter reports the existing 422 validation error for invalid files", () => {
  fileFilter(
    {},
    {
      originalname: "poster.gif",
      mimetype: "image/gif",
    },
    (error) => {
      assert.equal(error.message, "Only JPG, PNG, and PDF files are allowed");
      assert.equal(error.status, 422);
    },
  );
});

test("fileFilter accepts valid files", () => {
  fileFilter(
    {},
    {
      originalname: "poster.png",
      mimetype: "image/png",
    },
    (error, accepted) => {
      assert.equal(error, null);
      assert.equal(accepted, true);
    },
  );
});
