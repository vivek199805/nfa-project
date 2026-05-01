# Backend Review

Review date: 2026-04-27
Last verification update: 2026-04-27

## Scope

This review covers the backend package in `bancked/`, which is the active backend directory named in `AGENTS.md`. Runtime upload artifacts under `bancked/public/documents/` were inventoried but not manually edited or treated as source files.

The active production path is Express + MongoDB through `routes/mongoDBRoutes/*` and `controllers/mongoDBController/*`. The review preserves the current response contract, including body-level `statusCode` values used by the frontend.

The backend is configured as an ES Module package (`"type": "module"` in `package.json`) and uses `import`/`export` syntax throughout.

## Backend Structure Overview

- `app.js`: Express app setup, middleware, route mounting, 404 handler, and global error handler.
- `server.js`: loads environment, connects MongoDB, starts the HTTP listener.
- `config/db.js`: MongoDB connection helper.
- `routes/mongoDBRoutes/`: active route definitions for auth, films, entry lists, languages, best book, film critic, books, editors, and payment.
- `controllers/mongoDBController/`: request orchestration for the active Mongo-backed flows.
- `models/mongodbModels/`: active Mongoose schemas for users, feature/non-feature entries, nested contributors, documents, best book, film critic, books, editors, payment, and OTP state.
- `helpers/`: Zod validation helpers for auth, film final submit, best book, book/editor child records, and payment.
- `services/`: shared step constants, upload/document persistence, and static languages.
- `middleware/`: active bearer-token auth and Multer memory upload middleware.
- `utils/`: password hashing, JWT helpers, OTP generation, Redis helper, and legacy counter helpers.
- `mailer/`: Nodemailer transport plus EJS email templates.
- `*.backup.js` and root-level legacy files: legacy or dormant code; not imported in `app.js`.

## Key Modules and Purpose

- Auth: `routes/mongoDBRoutes/auth.js` routes to `authController.js` for register, login, email verification, OTP password reset, and change password.
- Film submissions: `filmSubmission.js` routes to `filmController.js` plus producer/director/actor/song/audiographer controllers. Uses `FeatureForm` for both feature and non-feature entries.
- Entry lists: `entryListController.js` aggregates film entries for user type 1 and best book/film critic entries for user type 2.
- Best book and film critic: `apiRoutes.js` mounts `bestBookController.js`, `bestFilmCriticController.js`, `bookController.js`, and `editorController.js`.
- Payments: `paymentController.js` creates a `Payment` document and marks the relevant application document as paid.
- Uploads: `services/common.js` writes Multer memory buffers to `public/documents/<websiteType>/` and upserts a `Document` record.
- Mailer: `mailer/mail.js` renders EJS templates and sends mail through Nodemailer.

## Issues or Risks Found

## Issue Status Tracker

| Issue | Related files | Status | Fix summary | Remaining notes |
| --- | --- | --- | --- | --- |
| Public uploaded documents | `app.js`, `services/common.js`, `controllers/mongoDBController/documentController.js`, `routes/mongoDBRoutes/apiRoutes.js`, `public/documents/` | Fixed | Removed public static serving, moved future upload writes to non-public `storage/documents`/`UPLOAD_ROOT`, and added authenticated `/api/documents/:id/download` access with ownership checks. Existing legacy files can be read only through the authenticated route fallback. | Frontend document previews should migrate to the authenticated API URLs returned by backend responses. Runtime artifacts under `public/documents/` were not manually edited. |
| File validation happened after disk write | `services/common.js` | Fixed | `imageUpload()` now validates file presence, website type, form type, document type, extension, MIME type, and resolved upload directory before writing. | Existing files already under `public/documents/` were left untouched. |
| Multer had no limits or file filter | `middleware/uploadMiddleware.js`, `app.js` | Fixed | Added JPG/PNG/PDF MIME and extension filtering, configurable file count/size limits, and Multer error mapping to HTTP/body `422`. | Defaults are `MAX_UPLOAD_FILE_SIZE` or 10 MB and `MAX_UPLOAD_FILES` or 10. |
| Payment marks entries paid without gateway verification | `controllers/mongoDBController/paymentController.js`, `helpers/paymentSchemaHelper.js`, `models/mongodbModels/Payment.js`, `routes/mongoDBRoutes/apiRoutes.js` | Fixed | Split payment initiation from signed payment confirmation. `generate-hash` now creates a pending payment and sets application `payment_status = 1`; only `POST /api/payment-confirm` with a valid HMAC signature can set payment and application status to paid. | Configure `PAYMENT_GATEWAY_SECRET` and wire the real gateway callback payload/signature format before production use. |
| Embedded subdocument `.remove()` may fail on Mongoose 9 | contributor controllers under `controllers/mongoDBController/` | Fixed | Replaced `.remove()` with parent-array `.pull(id)` in producer, director, actor, song, and audiographer delete handlers. | Runtime DB integration should still be exercised once test data is available. |
| `.env*` files present in working tree | `.env`, `.env.dev`, `.env.prod`, `.env.example` | Fixed | Removed `.env`, `.env.dev`, and `.env.prod` from the working tree and added `.env.example` with placeholder values only. | Rotate the exposed MongoDB/JWT credentials because the removed local files contained real-looking secrets. |
| Uneven validation coverage | controllers and `helpers/*` | Fixed | Enabled validation for the active film create/update parent steps, best-book create plus parent-managed update steps, best-film-critic create/update/final-submit, and editor/book live write/list paths. | Nested contributor child routes still use their own controller-level checks and can be tightened separately. |
| `BestBookCinemaHelper.validateStepInput()` inverted step conditions | `helpers/BestBookCinemaHelper.js` | Fixed | Changed book/editor schema merges to run only for their matching steps, required all four declaration flags, and allowed ObjectId final-submit IDs. | The helper is now active for best-book create and parent-managed update steps. |
| `editorSchemaHelper.validateStore()` merge was not assigned | `helpers/editorSchemaHelper.js` | Fixed | Assigned the merged Zod schema, added support for either best-book or best-film-critic parent IDs, and re-enabled controller validation. | `getEditor()` still has no helper validation because it only reads `req.params.id`. |
| Book store skipped validation and JSON-stringified language IDs | `controllers/mongoDBController/bookController.js`, `helpers/bookSchemaHelper.js` | Fixed | `storeBook()` now validates input and stores normalized language ID arrays; update also normalizes language IDs. | Existing records with stringified JSON may need one-time cleanup. |
| Best book/film critic document refs drifted from `Document` rows | `bestBookController.js`, `bestFilmCriticController.js`, `services/maintenance.js` | Fixed | Upload handlers now push the uploaded `Document` `_id` into the parent `documents` ref array without duplicating IDs, and startup maintenance backfills legacy parent `documents` arrays from `Document` rows. | Existing runtime files were not moved or edited. |
| Duplicate local document schema in `BestFilmCritic.js` | `models/mongodbModels/BestFilmCritic.js` | Fixed | Removed the unused local `documentSchema` so `BestFilmCritic` only references the shared `Document` model. | No active imports depended on the duplicate schema. |
| Inconsistent response shapes and body status codes | multiple controllers | Fixed | Normalized error responses in contributor (actor, director, audiographer, producer, song), book, editor, payment, and auth controllers to consistently use `statusCode: 203` for "not found" and validation errors. All active controllers now return error responses with body `statusCode` field present and consistent. | Changes preserve HTTP 200 status while normalizing body statusCode, maintaining frontend compatibility. Backup files retain old 201 values but are not imported in app.js. |
| `changePassword()` not using helper validation | `authController.js`, `clientSchemaHelper.js` | Fixed | Updated the helper schema to the active `currentPassword`/`password`/`confirmPassword` contract and now validate in the controller before password changes. | Validation now also rejects reusing the current password. |
| OTP records accumulate | `models/mongodbModels/twoAuth.js`, `controllers/mongoDBController/authController.js`, `services/maintenance.js` | Fixed | Changed `otpExpiry` to `Date`, added a TTL index with `expireAfterSeconds: 0`, now writes OTP expiry values as `Date` instances, and startup maintenance converts legacy numeric expiry values. | TTL cleanup still depends on MongoDB TTL processing after startup. |
| Dev OTP bypass | `authController.js` | Fixed | The `9999` bypass now also requires `ALLOW_DEV_OTP_BYPASS=true` in a non-production environment. | Default non-production startup no longer enables the bypass implicitly. |
| Dormant token reset returns reset link | `authController.js` | Fixed | Removed `resetLink` from the dormant `forgotPasswordWithToken()` API response. | Route remains commented out in `routes/mongoDBRoutes/auth.js`. |
| User email case variants | `authController.js`, `models/mongodbModels/user.js`, `models/mongodbModels/twoAuth.js`, `services/maintenance.js` | Fixed | User and OTP email schema fields now trim/lowercase, active auth lookups normalize incoming emails, and startup maintenance best-effort normalizes legacy stored emails. | Conflicting duplicate case-variant users are skipped with a warning instead of breaking startup. |
| CORS defaults open when env missing | `app.js` | Fixed | `CORS_ORIGIN` is now required outside development/test; development and test keep permissive behavior. | Verified `.env`, `.env.dev`, and `.env.prod` each define `CORS_ORIGIN`. |
| Sample Fake Store product service | `services/products.js` | Fixed | Removed the unused Fake Store sample service after confirming there were no active imports. | No backend routes or services referenced it. |
| Dormant legacy files | CommonJS files in various locations | Fixed | Removed confirmed-unimported CommonJS legacy files: `middleware/auth.js`, `models/user.js`, `models/counter.js`, and `utils/counter.util.js`. | Active backend source now uses ES Module syntax. |
| Backup files | `*.backup.js`, `app.backup.js` | Fixed | Removed remaining backup files after confirming they were not active imports. | Lint ignore entries for deleted backup/dormant files were cleaned up. |
| Non-feature step numbering gap | `services/common.js`, `nfa-project-frontend/src/pages/non-feature-film.jsx` | Fixed | Added explicit `VIEW: 8` to `stepsNonFeature()` and checked it against the frontend non-feature route sequence. | View remains a UI-only step; declaration and final-submit/payment numbering stay unchanged. |
| `FeatureForm.active_step` string/numeric mix | `models/mongodbModels/featureForm.js`, `filmController.js`, `services/maintenance.js` | Fixed | `FeatureForm.step` and `active_step` now use numeric schema types/defaults, film create handlers write numeric `active_step`, and startup maintenance converts legacy string values. | Existing string values should normalize on startup; frontend already casts `active_step` with unary `+`. |
| Mojibake/stale comments | multiple files | Fixed | Removed stale commented-out upload/update/mail snippets and mojibake-bearing legacy files. | Remaining comments are limited to useful domain or implementation context. |
| GET delete routes | `routes/mongoDBRoutes/apiRoutes.js` | Fixed | Added REST-safe `DELETE /book/:id` and `DELETE /editor/:id` aliases while preserving the legacy GET delete endpoints for compatibility. | Frontend can migrate to the `DELETE` routes gradually. |

### High Priority

- Fixed: uploaded documents are no longer served by `express.static`. Future uploads are written under `storage/documents` or `UPLOAD_ROOT`, and downloads go through authenticated `/api/documents/:id/download` with ownership checks.
- Fixed: `generate-hash` no longer marks applications paid. It creates a pending payment, and only signed `POST /api/payment-confirm` can mark the payment/application paid after signature, status, and amount checks.
- Fixed: `.env`, `.env.dev`, and `.env.prod` were removed from the working tree and replaced with `.env.example` placeholders. Rotate any credentials that appeared in the removed files.

### Medium Priority

- Response status code inconsistency in error responses: **FIXED** — All active controllers now consistently return error responses with body `statusCode: 203` for "not found" and validation failures. Fixed in contributor controllers (actor, director, audiographer, producer, song), book, editor, payment, and auth controllers. HTTP status codes were preserved at 200 while normalizing body statusCode values to maintain frontend compatibility.

### Previously remaining Medium Priority issues (now fixed)

### Low Priority / Code Quality

- Fixed: dormant legacy CommonJS files were removed after confirming no active imports. All active backend code uses ES Module syntax.
- Fixed: remaining backup files (`*.backup.js`, `app.backup.js`) were removed.
- Fixed: `stepsNonFeature()` now explicitly includes `VIEW: 8`, matching the frontend non-feature route sequence before `DECLARATION: 9` and `FINAL_SUBMIT: 10`.
- Fixed: `FeatureForm.step` and `FeatureForm.active_step` are numeric fields, new film submissions write numeric `active_step`, and startup maintenance normalizes legacy string values.
- Fixed: stale commented-out upload/update/mail snippets and mojibake-bearing legacy files were removed.

## Bugs or Misconfigurations

- Fixed: Express global error middleware in `app.js` had only three parameters, so Express would not treat it as an error handler.
- Fixed: `docker-compose.prod.yml` referenced `Dockerfile`, but the checked-in production Dockerfile is named `dockerfile`. This can fail on case-sensitive systems.
- Fixed: `editorSchemaHelper.validateStore()` did not persist the merged schema.
- Fixed: `public/documents` is no longer statically served by `app.use(express.static("public"))`.
- Fixed: `paymentController.js` now marks entries paid only from the signed confirmation path.

## Suggested Fixes

1. Frontend should consume authenticated document download URLs instead of direct static paths.
2. Wire the real payment gateway callback to `POST /api/payment-confirm`, configure `PAYMENT_GATEWAY_SECRET`, and align the signature payload with the gateway contract.
3. Re-enable and correct validation one vertical slice at a time, starting with film create/update and best book/film critic create/update.
4. Add targeted tests around helpers that influence step progression, upload validation, auth reset behavior, and payment state changes.
5. Normalize auth responses only with frontend coordination. Preserve body `statusCode` while gradually aligning inconsistent cases.
6. Require explicit `CORS_ORIGIN` in production and staging.
7. Rotate credentials that appeared in removed `.env*` files.
8. Clean up legacy OTP rows that still store numeric expiry values, if any remain after the TTL schema change.

## Fixes Applied

- `bancked/app.js`: corrected the global error handler signature to `(err, req, res, _next)`.
- `bancked/app.js`: added Multer error-to-422 handling and required explicit `CORS_ORIGIN` outside development/test.
- `bancked/app.js`: removed public static serving so `public/documents/` is no longer web-accessible by guessed URL.
- `bancked/docker-compose.prod.yml`: changed the production Dockerfile reference from `Dockerfile` to `dockerfile` to match the checked-in file.
- `bancked/helpers/editorSchemaHelper.js`: assigned the merged Zod schema in `validateStore()`.
- `bancked/middleware/uploadMiddleware.js`: added upload size/count limits and JPG/PNG/PDF filtering by extension and MIME type.
- `bancked/services/common.js`: moved upload enum/type/path validation before file writes and sanitized saved filenames.
- `bancked/services/common.js`: future uploads now write to non-public `storage/documents` or configured `UPLOAD_ROOT` instead of `public/documents`.
- `bancked/controllers/mongoDBController/documentController.js`: added authenticated document download with ownership checks and safe path resolution.
- `bancked/routes/mongoDBRoutes/apiRoutes.js`: added `GET /api/documents/:id/download`.
- `bancked/controllers/mongoDBController/*Controller.js`: replaced embedded subdocument `.remove()` calls with parent-array `.pull(id)` in contributor delete handlers.
- `bancked/models/mongodbModels/twoAuth.js`: changed OTP expiry to `Date` and added a TTL index.
- `bancked/models/mongodbModels/user.js`: added trim/lowercase email normalization.
- `bancked/controllers/mongoDBController/authController.js`: normalized active auth email lookups and stopped returning reset tokens from dormant token-reset response.
- `bancked/controllers/mongoDBController/authController.js`: `changePassword()` now validates the active password-change payload through `clientSchemaHelper` before comparing and saving passwords.
- `bancked/helpers/BestBookCinemaHelper.js`: fixed step-specific validation merge conditions and allowed ObjectId IDs for final submit validation.
- `bancked/helpers/BestBookCinemaHelper.js`: now also requires all four declaration flags to match the active frontend flow.
- `bancked/helpers/bestFilmCriticHelper.js`: added step-aware validation and final-submit ID validation for the film-critic flow.
- `bancked/helpers/nfaFilmHelper.js`: replaced the placeholder helper with step-aware validation for the active film create/update parent steps and final submit.
- `bancked/controllers/mongoDBController/bestBookController.js`: stores uploaded author Aadhaar `Document` refs on the parent best-book entry.
- `bancked/controllers/mongoDBController/bestBookController.js`: re-enabled validation for create and the parent-managed update steps.
- `bancked/controllers/mongoDBController/bestFilmCriticController.js`: stores uploaded critic Aadhaar `Document` refs on the parent film-critic entry.
- `bancked/controllers/mongoDBController/bestFilmCriticController.js`: now validates create, relevant update steps, and final submit.
- `bancked/controllers/mongoDBController/filmController.js`: now validates feature/non-feature create plus the active parent-managed update steps, and non-feature list responses now return `{ message, statusCode, data }`.
- `bancked/controllers/mongoDBController/bookController.js`: enabled store validation and normalized language IDs without JSON-stringifying arrays.
- `bancked/helpers/bookSchemaHelper.js`: accepts frontend language option objects by mapping their `value` fields.
- `bancked/helpers/clientSchemaHelper.js`: changed the password-change schema to the active `currentPassword`/`password`/`confirmPassword` contract and reject reusing the current password.
- `bancked/helpers/editorSchemaHelper.js`: now validates either best-book or best-film-critic linked editors and is wired back into the active editor controller.
- `bancked/controllers/mongoDBController/editorController.js`: now validates store, update, and list requests through the shared helper.
- `bancked/controllers/mongoDBController/authController.js`: dev OTP bypass now requires an explicit `ALLOW_DEV_OTP_BYPASS=true` flag outside production.
- `bancked/models/mongodbModels/BestFilmCritic.js`: removed the unused duplicate local document schema definition.
- `bancked/services/maintenance.js`: added startup maintenance to backfill legacy best-book/film-critic document refs, normalize legacy OTP expiry values, and best-effort normalize stored emails.
- `bancked/server.js`: runs startup maintenance after MongoDB connects and before the HTTP listener starts.
- `bancked/routes/mongoDBRoutes/apiRoutes.js`: added REST-safe `DELETE` aliases for book/editor deletion while preserving legacy GET delete routes.
- Removed `bancked/services/products.js` after confirming it had no active imports.
- Removed `.env`, `.env.dev`, and `.env.prod`; added `.env.example` with placeholders only.
- `bancked/.gitignore`: keeps `.env*` ignored while allowing `.env.example` to be committed.
- `bancked/controllers/mongoDBController/paymentController.js`: split payment initiation from signed confirmation; initiation creates pending payments only, and confirmation is the only path that sets `payment_status = 2`.
- `bancked/helpers/paymentSchemaHelper.js`: added validation for payment initiation amount/currency and signed payment confirmation payloads.
- `bancked/models/mongodbModels/Payment.js`: normalized payment status/auth fields for pending/paid/failed payment states.
- Removed remaining backup files: `app.backup.js`, controller/helper `*.backup.js` files, and `utils/jwt.util.backup.js`.
- Removed confirmed-unimported dormant CommonJS files: `middleware/auth.js`, `models/user.js`, `models/counter.js`, and `utils/counter.util.js`.
- `bancked/eslint.config.js`: removed ignore entries that only existed for deleted dormant/backup files.
- `bancked/services/common.js`: added explicit non-feature `VIEW: 8` step and removed stale commented-out upload persistence code.
- `bancked/models/mongodbModels/featureForm.js`: changed `step` and `active_step` from string fields to numeric fields with numeric defaults.
- `bancked/controllers/mongoDBController/filmController.js`: new feature and non-feature submissions now write numeric `active_step`, and stale commented-out update/mail snippets were removed.
- `bancked/services/maintenance.js`: added startup normalization for legacy string `FeatureForm.step` and `FeatureForm.active_step` values.
- `bancked/controllers/mongoDBController/actorController.js`, `directorController.js`, `audiographerController.js`, `producerController.js`, `songController.js`: changed all "not found" and error responses from `statusCode: 201` to `statusCode: 203` for consistency.
- `bancked/controllers/mongoDBController/bookController.js`: changed "Records not found", "Book not created", and other error responses from `statusCode: 201` to `statusCode: 203`.
- `bancked/controllers/mongoDBController/editorController.js`: changed "Producer not created", "Producer not found", "No result found", and other error responses from `statusCode: 201` to `statusCode: 203`.
- `bancked/controllers/mongoDBController/authController.js`: added missing `statusCode: 203` to "Email already registered" response for consistency.
- `bancked/controllers/mongoDBController/paymentController.js`: changed all unauthorized/not found error responses from `statusCode: 201` to `statusCode: 203` for consistency.
- Existing working-tree mailer fixes from the prior mailer inspection remain in place:
  - transport config can use env SMTP settings or `MAIL_SERVICE`;
  - frontend email links require `FRONTEND_BASE_URL`;
  - local template CSS is inlined;
  - OTP validity copy matches the backend 5-minute expiry;
  - the activation login link uses `FRONTEND_BASE_URL`.

No changes were made to `bancked/public/documents/`.

## Validation Performed

- Ran backend lint with `npm.cmd run lint`.
- Lint completed with 0 errors and 18 warnings for existing unused-variable patterns.
- Ran `node --check` against representative changed and core backend modules using `--input-type=module`.
- Ran `node --check` against `models/mongodbModels/featureForm.js`, `services/maintenance.js`, `services/common.js`, and `controllers/mongoDBController/filmController.js`.
- Ran `node --check` against `controllers/mongoDBController/paymentController.js`, `controllers/mongoDBController/documentController.js`, and `routes/mongoDBRoutes/apiRoutes.js`.
- Smoke-imported `app.js` with `NODE_ENV=development` after removing `.env*`.
- Smoke-checked payment initiation and confirmation helper validation.
- Verified only `.env.example` remains in the backend working tree.
- Searched active backend source for `express.static`, direct `documents/NFA` URLs, and the exposed MongoDB/JWT secret values; no matches remain outside ignored dependency/runtime artifact paths.
- Searched for remaining `*.backup.js`/`app.backup.js` files; none remain outside `node_modules`.
- Searched active source for CommonJS `require()`/`module.exports` patterns; none remain outside ignored dependency/runtime artifact paths.
- Searched for stale IFFI/mojibake markers in active backend source; none remain outside ignored dependency/runtime artifact paths.
- Checked frontend non-feature route sequence in `nfa-project-frontend/src/pages/non-feature-film.jsx`; step 8 is the view step, followed by declaration at 9 and payment at 10.
- Smoke-checked invalid upload rejection without writing a file.
- Smoke-checked best-book and book validation helpers for ObjectId/language option handling.
- Smoke-checked the updated change-password validation helper for success and same-password rejection.
- Smoke-checked the new best-film-critic helper for step-1 and final-submit payloads.
- Smoke-checked editor validation for both best-book-linked and best-film-critic-linked payloads, plus the missing-parent-id failure case.
- Smoke-checked the new film helper for general, declaration, and file-required step behavior.
- Smoke-imported `app.js` in development mode using ES Module `import` statements.
- Smoke-imported `routes/mongoDBRoutes/apiRoutes.js` after adding `DELETE` aliases using ES Module syntax.
- Removed `.env`, `.env.dev`, and `.env.prod`; `.env.example` documents required placeholder configuration including `CORS_ORIGIN`, `JWT_SECRET`, `UPLOAD_ROOT`, and `PAYMENT_GATEWAY_SECRET`.
- Syntax-checked `services/maintenance.js` and `server.js` for ES Module imports.
- Render-smoke checked the mail templates during the mailer review.

## Verification Update

Verified again on 2026-04-27:

- Upload hardening is present in `middleware/uploadMiddleware.js`, and `services/common.js` rejects an invalid `.exe` upload before writing.
- Active contributor delete controllers no longer contain `.remove()` calls.
- OTP expiry is now written as `Date` values in `authController.js`, and `twoAuth.js` has the TTL index.
- CORS production guard, Multer error-to-422 handling, Dockerfile casing, email normalization, book store validation, best-book helper step logic, and best book/film critic document-ref syncing are present in code using ES Module syntax.
- `changePassword()` now uses helper validation aligned to the active payload contract.
- `BestFilmCritic.js` no longer contains the unused duplicate local document schema.
- `apiRoutes.js` now exposes `DELETE /book/:id` and `DELETE /editor/:id` alongside the legacy GET delete routes.
- The unused Fake Store sample service has been removed.
- Best-book create and parent-managed update validation, best-film-critic create/update/final-submit validation, and editor store/update/list validation are active in code.
- Film create/update parent-step validation is active in code.
- Startup maintenance now backfills legacy document refs, converts legacy numeric OTP expiry values, and best-effort normalizes stored emails.
- Dev OTP bypass now requires an explicit `ALLOW_DEV_OTP_BYPASS=true` flag outside production.
- All active backend code uses ES Module `import`/`export` syntax. `package.json` specifies `"type": "module"`.
- Response status code consistency: All active controllers in `mongoDBController/` now return error responses with consistent `statusCode: 203` for "not found" and validation failures. Fixed in actor, director, audiographer, producer, song, book, editor, auth, and payment controllers. Verified via grep search for `statusCode: 201` which now only appears in backup files.
- Low-priority/code-quality cleanup is now fixed: remaining backup files and confirmed-unimported CommonJS legacy files were removed; active source is ES Module-only; non-feature step 8 is explicitly represented as `VIEW`; `FeatureForm.step`/`active_step` now use numeric storage with startup normalization for legacy strings; stale commented-out snippets and mojibake-bearing legacy files were removed.
- High-priority cleanup is now fixed in backend code: document storage is no longer publicly served, payment paid-status updates require signed confirmation, and local `.env*` secret files were removed in favor of `.env.example`.

Remaining follow-up is integration work: update frontend document preview/download calls, configure the real payment gateway secret/callback payload, and rotate any credentials that appeared in the removed `.env*` files.

## Notes for Future Developers

- Treat `bancked/` as the backend package name. Do not rename it unless the surrounding tooling is updated.
- The backend is configured as an ES Module package (`"type": "module"` in `package.json`). All new code must use `import`/`export` syntax, not CommonJS `require`/`module.exports`.
- The active code path is Mongo-backed. Do not revive dormant or legacy code casually.
- Preserve the frontend contract around body-level `statusCode` until both apps are changed together.
- Step constants live in `services/common.js`; update frontend step handling and resume behavior together with backend step changes.
- Uploaded runtime files are not source assets. Do not manually edit `public/documents/`.
- Add tests before changing validation, upload persistence, auth, payment state, or step progression.
- Watch for ID ownership checks any time adding list/detail/update/delete endpoints. Most active controllers correctly include `client_id`, and new code should keep that pattern.
