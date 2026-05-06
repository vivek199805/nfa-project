import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Document } from "../models/mongodbModels/document.js";
import {
  documentTypeMap,
  formType,
  imageUpload,
  websiteType,
} from "./common.js";

const originalUploadRoot = process.env.UPLOAD_ROOT;
const originalFindOneAndUpdate = Document.findOneAndUpdate;
const originalDateNow = Date.now;
const tempUploadRoots = [];

test.afterEach(() => {
  if (originalUploadRoot === undefined) {
    delete process.env.UPLOAD_ROOT;
  } else {
    process.env.UPLOAD_ROOT = originalUploadRoot;
  }

  Document.findOneAndUpdate = originalFindOneAndUpdate;
  Date.now = originalDateNow;

  while (tempUploadRoots.length > 0) {
    fs.rmSync(tempUploadRoots.pop(), { recursive: true, force: true });
  }
});

test("imageUpload writes sanitized files and upserts document metadata", async () => {
  const uploadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nfa-upload-"));
  tempUploadRoots.push(uploadRoot);
  process.env.UPLOAD_ROOT = uploadRoot;
  Date.now = () => 1777312000000;

  let receivedFilter;
  let receivedDetails;
  let receivedOptions;

  Document.findOneAndUpdate = async (filter, details, options) => {
    receivedFilter = filter;
    receivedDetails = details;
    receivedOptions = options;
    return { _id: "doc_1", ...details };
  };

  const result = await imageUpload({
    id: "entry-123",
    websiteType: "NFA",
    formType: "FEATURE",
    image_key: "CENSOR_CERTIFICATE_FILE",
    image: {
      originalname: "../Censor Certificate Final.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("pdf bytes"),
    },
  });

  assert.equal(result.status, true);
  assert.equal(result.message, "File uploaded successfully!!");
  assert.deepEqual(receivedFilter, {
    context_id: "entry-123",
    form_type: formType.FEATURE,
    document_type: documentTypeMap.CENSOR_CERTIFICATE_FILE,
    website_type: websiteType.NFA,
  });
  assert.deepEqual(receivedOptions, {
    new: true,
    upsert: true,
  });
  assert.equal(receivedDetails.file, "Censor_Certificate_Final_1777312000000.pdf");
  assert.equal(receivedDetails.name, "Censor Certificate Final.pdf");
  assert.equal(receivedDetails.context_id, "entry-123");
  assert.equal(
    fs.readFileSync(
      path.join(uploadRoot, "NFA", "Censor_Certificate_Final_1777312000000.pdf"),
      "utf8",
    ),
    "pdf bytes",
  );
});

test("imageUpload rejects unsupported file extensions or MIME types", async () => {
  Document.findOneAndUpdate = async () => {
    throw new Error("Document write should not be reached");
  };

  const result = await imageUpload({
    id: "entry-123",
    websiteType: "NFA",
    formType: "FEATURE",
    image_key: "CENSOR_CERTIFICATE_FILE",
    image: {
      originalname: "certificate.exe",
      mimetype: "image/png",
      buffer: Buffer.from("not an image"),
    },
  });

  assert.equal(result.status, false);
  assert.equal(result.message, "Only JPG, PNG, and PDF files are allowed!");
});

test("imageUpload rejects invalid document metadata keys before writing", async () => {
  const uploadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nfa-upload-"));
  tempUploadRoots.push(uploadRoot);
  process.env.UPLOAD_ROOT = uploadRoot;
  Document.findOneAndUpdate = async () => {
    throw new Error("Document write should not be reached");
  };

  const result = await imageUpload({
    id: "entry-123",
    websiteType: "NFA",
    formType: "FEATURE",
    image_key: "UNSUPPORTED_DOCUMENT",
    image: {
      originalname: "certificate.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("pdf bytes"),
    },
  });

  assert.equal(result.status, false);
  assert.equal(result.message, "Invalid document type");
  assert.equal(fs.existsSync(path.join(uploadRoot, "NFA")), false);
});
