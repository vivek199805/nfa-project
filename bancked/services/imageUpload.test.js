import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  documentTypeMap,
  formType,
  imageUpload,
  websiteType,
} from "./common.js";

const originalUploadRoot = process.env.UPLOAD_ROOT;
const originalDateNow = Date.now;
const tempUploadRoots = [];

test.afterEach(() => {
  if (originalUploadRoot === undefined) {
    delete process.env.UPLOAD_ROOT;
  } else {
    process.env.UPLOAD_ROOT = originalUploadRoot;
  }

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
  const prisma = {
    document: {
      findFirst: async () => null,
      upsert: async ({ where, create, update }) => {
        receivedFilter = where.context_id_form_type_document_type_website_type;
        receivedDetails = update;
        assert.deepEqual(create, update);
        return { id: "doc_1", ...update };
      },
    },
  };

  const result = await imageUpload({
    prisma,
    id: "entry-123",
    userId: "user-77",
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
  assert.match(
    receivedDetails.file,
    /^user_user-77\/form_1\/context_entry-123\/doc_1\/Censor_Certificate_Final_1777312000000_[a-f0-9]{8}\.pdf$/,
  );
  assert.equal(receivedDetails.name, "Censor Certificate Final.pdf");
  assert.equal(receivedDetails.context_id, "entry-123");
  assert.equal(
    fs.readFileSync(
      path.join(uploadRoot, "NFA", ...receivedDetails.file.split("/")),
      "utf8",
    ),
    "pdf bytes",
  );
});

test("imageUpload rejects unsupported file extensions or MIME types", async () => {
  const result = await imageUpload({
    id: "entry-123",
    userId: "user-77",
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

test("imageUpload replaces an existing stored file only after the new record is saved", async () => {
  const uploadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nfa-upload-"));
  tempUploadRoots.push(uploadRoot);
  process.env.UPLOAD_ROOT = uploadRoot;
  Date.now = () => 1777312000000;

  const existingRelativePath = "user_user-77/form_1/context_entry-123/doc_1/old_certificate.pdf";
  const existingAbsolutePath = path.join(uploadRoot, "NFA", ...existingRelativePath.split("/"));
  fs.mkdirSync(path.dirname(existingAbsolutePath), { recursive: true });
  fs.writeFileSync(existingAbsolutePath, "old pdf bytes");

  const prisma = {
    document: {
      findFirst: async () => ({
        id: "doc_old",
        file: existingRelativePath,
        website_type: websiteType.NFA,
      }),
      upsert: async ({ update }) => ({ id: "doc_new", ...update }),
    },
  };

  const result = await imageUpload({
    prisma,
    id: "entry-123",
    userId: "user-77",
    websiteType: "NFA",
    formType: "FEATURE",
    image_key: "CENSOR_CERTIFICATE_FILE",
    image: {
      originalname: "new certificate.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("new pdf bytes"),
    },
  });

  assert.equal(result.status, true);
  assert.equal(fs.existsSync(existingAbsolutePath), false);
  assert.equal(
    fs.readFileSync(path.join(uploadRoot, "NFA", ...result.data.file.split("/")), "utf8"),
    "new pdf bytes",
  );
});

test("imageUpload keeps the old file when persistence fails and removes the new orphan", async () => {
  const uploadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nfa-upload-"));
  tempUploadRoots.push(uploadRoot);
  process.env.UPLOAD_ROOT = uploadRoot;
  Date.now = () => 1777312000000;

  const existingRelativePath = "user_user-77/form_1/context_entry-123/doc_1/old_certificate.pdf";
  const existingAbsolutePath = path.join(uploadRoot, "NFA", ...existingRelativePath.split("/"));
  fs.mkdirSync(path.dirname(existingAbsolutePath), { recursive: true });
  fs.writeFileSync(existingAbsolutePath, "old pdf bytes");

  const prisma = {
    document: {
      findFirst: async () => ({
        id: "doc_old",
        file: existingRelativePath,
        website_type: websiteType.NFA,
      }),
      upsert: async () => {
        throw new Error("database unavailable");
      },
    },
  };

  const result = await imageUpload({
    prisma,
    id: "entry-123",
    userId: "user-77",
    websiteType: "NFA",
    formType: "FEATURE",
    image_key: "CENSOR_CERTIFICATE_FILE",
    image: {
      originalname: "new certificate.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("new pdf bytes"),
    },
  });

  assert.equal(result.status, false);
  assert.equal(result.message, "database unavailable");
  assert.equal(fs.readFileSync(existingAbsolutePath, "utf8"), "old pdf bytes");
  assert.deepEqual(
    fs.readdirSync(path.join(uploadRoot, "NFA", "user_user-77", "form_1", "context_entry-123", "doc_1")),
    ["old_certificate.pdf"],
  );
});

test("imageUpload rejects invalid document metadata keys before writing", async () => {
  const uploadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nfa-upload-"));
  tempUploadRoots.push(uploadRoot);
  process.env.UPLOAD_ROOT = uploadRoot;
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
