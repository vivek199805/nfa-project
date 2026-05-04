# Backend Safe Refactor Plan

## Project Review Summary

Reviewed the `bancked/` backend as a Node.js ES module application built with Express and MongoDB/Mongoose for National Film Awards workflows. This review is backend-only; no React/frontend code is in scope.

Current backend shape:

- Runtime entrypoints:
  - `server.js` loads environment variables, connects MongoDB, runs startup maintenance, and starts Express.
  - `app.js` creates the Express app, configures JSON/body parsing, cookies, CORS, rate limiting, logging, active routes, 404 handling, and a global error handler.
- Active route layer:
  - `routes/mongoDBRoutes/auth.js`
  - `routes/mongoDBRoutes/languages.js`
  - `routes/mongoDBRoutes/entryList.js`
  - `routes/mongoDBRoutes/filmSubmission.js`
  - `routes/mongoDBRoutes/apiRoutes.js`
- Active controller layer:
  - `controllers/mongoDBController/*`
  - Covers auth, film submissions, contributors, best book, film critic, books/editors, documents, payments, languages, and dashboard entry aggregation.
- Persistence layer:
  - `models/mongodbModels/*`
  - Mongoose models for users, feature/non-feature submissions, best book, film critic, contributor child records, documents, payments, and OTP/auth support.
- Validation/helper layer:
  - `helpers/*` contains Zod-oriented request validation helpers.
  - `services/common.js` contains workflow step constants and document upload helpers.
  - `services/languages.js` and `services/maintenance.js` provide shared runtime operations.
- Middleware:
  - `middleware/requireAuth.js` validates Bearer JWTs and attaches `req.user`.
  - `middleware/uploadMiddleware.js` uses `multer.memoryStorage()` and validates file type/size before controllers persist documents.
- Utilities:
  - JWT, password hashing/comparison, OTP generation, Redis helper, counters, and auto-increment helpers live under `utils/`.
- Runtime artifacts:
  - `public/documents/` and `storage/documents/` contain uploaded/runtime files and must not be treated as source code during refactors.

Architecture observations:

- The active backend is a pragmatic layered monolith: route -> controller -> model/helper/service.
- Mongo-backed routes are the production path; no Appwrite backend path is currently present under `bancked/`.
- API response shape often uses body-level `statusCode`; this must be preserved for frontend compatibility.
- Step sequencing and document upload behavior are contract-sensitive and should be changed only with targeted tests.
- The backend currently has ESLint but no configured unit test script.

## Completed Tasks

- Reviewed backend root files and project metadata.
- Reviewed active Express app/server wiring.
- Reviewed active route files and route prefixes.
- Reviewed representative middleware and shared service/helper behavior.
- Reviewed backend source inventory.
- Confirmed source artifacts versus runtime upload artifacts.
- Ran backend lint baseline.
- Ran Node syntax checks across backend `.js` source files, excluding `node_modules`, `public`, and `storage`.
- Ran `npm.cmd test --if-present` to confirm current test-script status.
- Created this backend `safeRefactorPlan.md`.
- Completed Phase 1 lint-warning cleanup without changing backend business logic.
- Completed Phase 2 by adding a backend Node test harness and focused pure helper tests.
- Completed Phase 3 route readability pass across active Mongo route files without changing route behavior.
- Completed Phase 4 upload and document safety pass with focused upload validation and document metadata tests.
- Completed Phase 5 auth and payment safety pass with focused validation and controller branch tests.
- Completed Phase 6 response helper safety pass with a tiny controller response helper and focused tests.
- Completed Phase 7 environment documentation and production safety pass.
- Completed Phase 8 security, complexity, and code-smell pass.
- Completed Phase 9 contributor child-route validation pass.
- Completed Phase 10 contributor controller validation branch tests.
- Completed Phase 11 backend spelling and wording cleanup.
- Completed Phase 12 backend duplication reduction pass.

## Pending Tasks

- Continue with future targeted vertical passes only when a concrete feature or bug fix requires them.
- Rotate any real credentials present in ignored local environment files or external service dashboards.

## Current Phase

Current phase: Phase 12, Backend Duplication Reduction Pass.

Status: Completed.

Phase 12 scope:

- Reviewed all backend Markdown files before source edits.
- Scanned the active backend for repeated validation responses, Zod error formatting, numeric/ObjectId checks, language normalization patterns, and request user-id helpers.
- Centralized duplicated validation response and helper parsing logic while preserving business logic and API contracts.
- Left broader user-id helper consolidation for a future targeted pass because current call sites differ in precedence and string conversion.

## Next Step

All planned safe backend passes are complete. Future work should start from a specific feature, bug, or vertical slice.

## Phase-By-Phase Refactor Plan

### Phase 0: Backend Baseline Review and Verification

Goal: Establish the backend source map and verification baseline before refactoring.

Allowed changes:

- Create `safeRefactorPlan.md`.
- Run read-only inventory/review commands.
- Run lint, syntax checks, and test discovery commands.

Status: Completed.

Verification:

- `npm.cmd run lint`: passed with warnings.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test --if-present`: passed, no test script configured.

### Phase 1: Lint Warning Cleanup

Goal: Remove or rename unused variables/arguments without changing request handling, response bodies, database writes, or control flow.

Allowed changes:

- Rename intentionally unused callback arguments to `_next`, `_error`, `_files`, etc.
- Remove truly unused local variables only after confirming they have no side effects.
- Avoid changing catch behavior, response shape, route names, or status codes.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- `npm.cmd test --if-present`

Status: Completed.

Phase 1 results:

- Removed unused catch bindings where the caught error was not read.
- Removed unused route/controller callback arguments.
- Removed unused helper `files` parameters from validators that do not inspect files.
- Removed unused declaration-step `lastId` locals in best book and film critic controllers.
- Preserved the awaited password-update side effect in `resetPassword` while removing the unused assigned local.
- Preserved all response bodies, status codes, route names, middleware order, database calls, and workflow step behavior.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test --if-present`: passed, no test script configured.

### Phase 2: Helper and Validation Test Harness

Goal: Add low-risk backend tests around pure helper/validation behavior before touching risky controller logic.

Allowed changes:

- Add a test script only after selecting a backend test runner intentionally.
- Add focused tests for Zod helper schemas and pure utilities.
- Keep tests independent of MongoDB unless a DB test setup is deliberately added.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- Unit test command

Status: Completed.

Phase 2 results:

- Added a backend `test` script using Node.js built-in `node --test`.
- Added focused tests for auth/client validation helper behavior.
- Added focused tests for payment validation helper behavior.
- Added focused tests for workflow step and persisted form/website constants.
- Added focused tests for OTP generation shape and supported length validation.
- Avoided new dependencies and avoided MongoDB/network-bound tests in this phase.
- Preserved all runtime business logic.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: passed after rerun outside the sandbox due Node test runner worker spawn restrictions.

### Phase 3: Route and Controller Readability Pass

Goal: Improve route/controller readability while preserving active API contracts.

Allowed changes:

- Formatting and naming cleanup.
- Extract tiny pure helpers inside the same controller when it reduces duplication.
- Keep business logic out of route files.
- Preserve body-level `statusCode`, existing endpoint paths, auth middleware, upload middleware, and request payload parsing.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- Relevant unit tests if Phase 2 introduces them
- Manual route/contract trace for touched endpoints

Status: Completed for route readability.

Phase 3 results:

- Normalized import ordering and quote style in active Mongo route files.
- Removed stale commented-out route snippets from `auth.js` and `apiRoutes.js`.
- Replaced banner-style comments with concise route group labels.
- Added consistent spacing around route middleware and handler arguments.
- Preserved all endpoint paths, HTTP methods, middleware order, upload middleware usage, auth middleware usage, and controller handlers.
- Did not change controller logic, request parsing, response shape, validation, uploads, or persistence.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: passed after rerun outside the sandbox due Node test runner worker spawn restrictions.

### Phase 4: Upload and Document Safety Pass

Goal: Review upload handling without changing storage conventions.

Allowed changes:

- Add tests around file validation and document metadata helpers if feasible.
- Improve comments or small guard naming only where behavior is unchanged.
- Preserve `multer.memoryStorage()` plus `Common.imageUpload()` flow.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- Upload helper tests if added
- Manual trace of file fields and document records

Status: Completed.

Phase 4 results:

- Added direct tests for upload middleware validation:
  - allowed JPG/JPEG/PNG/PDF extension and MIME handling
  - unsupported extension/MIME rejection
  - existing `fileFilter` success callback shape
  - existing `fileFilter` 422 error shape
- Added direct tests for `Common.imageUpload()` behavior:
  - sanitized stored filename generation
  - temp storage write under `UPLOAD_ROOT/<websiteType>/`
  - document metadata upsert filter/details/options
  - unsupported file rejection before document writes
  - invalid document key rejection before directory writes
- Exported existing pure upload helpers for tests without changing default middleware/service APIs.
- Manually traced upload/document paths through active routes/controllers and confirmed the existing `multer.memoryStorage()` plus `Common.imageUpload()` flow is preserved.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: passed after rerun outside the sandbox due Node test runner worker spawn restrictions.

### Phase 5: Auth and Payment Safety Pass

Goal: Review high-risk auth/payment code only after lower-risk checks are stable.

Allowed changes:

- Add tests before behavior-affecting fixes.
- Improve consistency of handled errors only if response compatibility is preserved.
- Do not change JWT secrets, storage, OTP semantics, or payment payload shape without coordinated frontend/backend work.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- Auth/payment tests if added
- Manual contract trace

Status: Completed.

Phase 5 results:

- Added direct controller branch tests for auth:
  - `changePassword` validation failure before user lookup
  - `changePassword` unauthorized response when auth state has no user id
  - `resetPassword` validation failure before OTP lookup
- Added additional auth helper tests for:
  - OTP string coercion
  - short OTP rejection
  - reset password email/password validation
- Added direct controller branch tests for payment:
  - `createOrder` validation failure before Razorpay configuration checks
  - `createOrder` missing Razorpay configuration response
  - `verifyPayment` validation failure before secret checks
  - `verifyPayment` missing secret response
  - `verifyPayment` invalid signature rejection before payment lookup
- Added additional payment helper tests for amount/currency handling.
- Exported existing controller handlers as named exports for tests while preserving default controller object APIs used by routes.
- Manually traced active auth/payment routes and confirmed existing route handlers, response messages, status codes, body-level `statusCode`, JWT/OTP semantics, and Razorpay payload shape remain unchanged.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: passed after rerun outside the sandbox due Node test runner worker spawn restrictions.

### Phase 6: Response Helper Safety Pass

Goal: Review repeated response/error handling patterns and extract only low-risk helpers.

Allowed changes:

- Add small response helpers for repeated response shapes.
- Apply helpers only where existing tests cover the branches or where shape is trivially identical.
- Preserve HTTP statuses, body-level `statusCode`, response messages, and extra fields.
- Do not alter business logic, route names, auth behavior, payment behavior, or persistence.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- Unit tests for response helpers and touched controller branches
- Manual response-contract trace for touched endpoints

Status: Completed.

Phase 6 results:

- Added `controllers/mongoDBController/responseHelper.js`.
  - `sendValidationError()` preserves `{ message: "Validation failed", errors, statusCode: 422 }`.
  - `sendStatusMessage()` preserves simple `{ message, statusCode }` responses and existing extra fields.
- Added `controllers/mongoDBController/responseHelper.test.js`.
- Applied the helper only to selected auth/payment controller branches.
- Preserved default controller exports, active route wiring, body-level `statusCode`, response messages, auth behavior, payment behavior, and persistence.
- Reviewed repeated response patterns across controllers and left larger form/contributor controllers unchanged for a future vertical pass.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: passed after rerun outside the sandbox due Node test runner worker spawn restrictions.

### Phase 7: Environment Documentation and Production Safety Pass

Goal: Align environment documentation with runtime usage and fail early for unsafe production core config.

Allowed changes:

- Update `.env.example` with missing documented variables.
- Add tests around pure environment validation.
- Add startup checks for required core env vars.
- Require production CORS and reject example JWT secrets in production.
- Do not add hardcoded secrets or make optional integrations mandatory at startup.

Required verification after phase:

- `npm.cmd run lint`
- Node syntax check
- Environment validation tests
- Manual trace of env variables used by backend source

Status: Completed.

Phase 7 results:

- Added `services/environment.js`.
  - Requires `DB_URL` and `JWT_SECRET` at startup.
  - Requires `CORS_ORIGIN` in production.
  - Rejects known example JWT secret values in production.
- Added `services/environment.test.js`.
- Wired `assertStartupEnvironment()` in `server.js` before MongoDB connection and startup maintenance.
- Updated `.env.example` with documented values for CORS, mail transport options, dev OTP bypass, upload limits/root, and Redis.
- Compared `.env.example` against active `process.env` usage with `rg`.
- Preserved optional runtime behavior for Razorpay, mail, upload root, upload limits, and Redis.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: passed after rerun outside the sandbox due Node test runner worker spawn restrictions.

### Phase 8: Security, Complexity, and Code-Smell Pass

Goal: Improve backend security posture and maintainability without changing business logic.

Allowed changes:

- Add project-wide database filter hardening.
- Add focused tests for security configuration.
- Extract controller/helper decision logic into small pure helpers where behavior stays identical.
- Remove stale commented code containing banned `this` alias patterns.
- Update this plan with issues found, fixes applied, remaining risks, and validation.

Status: Completed.

Issues found:

- Many active controllers pass user-derived IDs into Mongoose filters. Most IDs are already protected by Zod validation and ownership filters, but the backend did not enable global Mongoose filter sanitization.
- `helpers/nfaFilmHelper.js` had a high-complexity step validation dispatcher.
- `controllers/mongoDBController/filmController.js` had high-complexity update step validation and handler selection.
- `models/mongodbModels/user.js` contained stale commented code with `const user = this` patterns.
- No hard-coded production credentials were found in active backend `.js` source. Credential-like matches were limited to test placeholders.
- The ignored local `.env` file contains populated credential keys. Values were not printed or committed, but any real external credentials in that file should be rotated outside the codebase.

Fixes applied:

- Enabled `mongoose.set("sanitizeFilter", true)` alongside existing `strictQuery` in `config/db.js`.
- Added `config/db.test.js` to assert global Mongoose query hardening remains enabled.
- Refactored `helpers/nfaFilmHelper.js` step validation into declarative rule lookup plus shared parse-result formatting.
- Refactored `controllers/mongoDBController/filmController.js` update validation and step-handler selection into small helpers.
- Removed stale commented auth/token methods from `models/mongodbModels/user.js`, eliminating commented `const user = this` code smell.
- Removed generated `coverage/` output after running tests; `.gitignore` already excludes it.

Files modified:

- `config/db.js`
- `config/db.test.js`
- `controllers/mongoDBController/filmController.js`
- `helpers/nfaFilmHelper.js`
- `models/mongodbModels/user.js`
- `safeRefactorPlan.md`

Remaining risks:

- Runtime MongoDB integration was not exercised against a live database in this phase.
- Some controllers still accept large user payload objects for embedded subdocuments; existing behavior was preserved, and global Mongoose filter sanitization now protects query filters.
- Real credentials, if present in ignored local `.env`, must be rotated in the relevant provider dashboards. Code cannot revoke external credentials by itself.

Next steps:

- Add targeted controller/helper tests before any future validation or step-flow behavior changes.
- Consider a future vertical validation pass for contributor child routes if product requirements allow stricter payload schemas.
- Keep rotating credentials out-of-band whenever local or historical environment files contain real values.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: sandboxed run failed with `spawn EPERM`; rerun outside the sandbox passed with 44 tests and 0 failures.

### Phase 9: Contributor Child-Route Validation Pass

Goal: Tighten contributor child-route request ID validation consistently without changing successful contributor workflows.

Allowed changes:

- Add focused helper tests before wiring controller validation.
- Validate only required and optional ID fields used by contributor child-route queries.
- Reuse existing validation response shape: HTTP `422` with `{ message, errors, statusCode: 422 }`.
- Preserve contributor payload passthrough, embedded array writes, upload behavior, route names, and body-level `statusCode` compatibility.

Status: Completed.

Issues found:

- Actor, producer, director, song, and audiographer controllers read body IDs directly before querying `FeatureForm` or embedded subdocuments.
- Missing or operator-shaped IDs could fall through to Mongoose casting and controller catch blocks instead of receiving a consistent validation response.
- Contributor routes had no shared ID-validation helper, so future fixes could drift by controller.

Fixes applied:

- Added `helpers/contributorSchemaHelper.js`.
  - Validates required IDs as numeric strings/numbers or MongoDB ObjectIds.
  - Allows optional child IDs to be absent for create flows while validating them when supplied for update flows.
  - Uses `.passthrough()` so existing contributor payload fields continue to pass unchanged.
- Added `helpers/contributorSchemaHelper.test.js`.
  - Covers valid ObjectId IDs, legacy numeric IDs, missing required IDs, and NoSQL operator-shaped ID rejection.
- Wired contributor ID validation into:
  - `actorController.js`
  - `producerController.js`
  - `directorController.js`
  - `songController.js`
  - `audiographerController.js`
- Reused `sendValidationError()` for consistent backend validation responses.

Files modified:

- `helpers/contributorSchemaHelper.js`
- `helpers/contributorSchemaHelper.test.js`
- `controllers/mongoDBController/actorController.js`
- `controllers/mongoDBController/producerController.js`
- `controllers/mongoDBController/directorController.js`
- `controllers/mongoDBController/songController.js`
- `controllers/mongoDBController/audiographerController.js`
- `safeRefactorPlan.md`

Remaining risks:

- Full contributor field-level validation is still intentionally out of scope; this pass validates only query-driving ID fields.
- Runtime MongoDB integration was not exercised against a live database.
- Existing successful payload passthrough remains broad by design to avoid breaking frontend form contracts.

Next steps:

- Future contributor work can add field-level Zod schemas one route family at a time if frontend payload contracts are confirmed.
- Add controller-level tests for contributor validation branches before changing response semantics or embedded subdocument persistence.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: sandboxed run failed with `spawn EPERM`; rerun outside the sandbox passed with 48 tests and 0 failures.

### Phase 10: Contributor Controller Validation Branch Tests

Goal: Add targeted controller-level tests for contributor validation branches before any future contributor response or persistence changes.

Allowed changes:

- Add tests only.
- Cover early validation responses for active contributor controllers.
- Avoid MongoDB calls by using invalid payloads that return before querying.
- Preserve all runtime controller behavior.

Status: Completed.

Issues found:

- Phase 9 added shared contributor ID validation, but only helper-level tests existed.
- Controller-level coverage was missing for the actual route handlers that wire `sendValidationError()`.

Fixes applied:

- Added `controllers/mongoDBController/contributorControllerValidation.test.js`.
  - Actor list rejects operator-shaped feature IDs.
  - Producer store rejects invalid optional producer IDs.
  - Director delete rejects missing child IDs.
  - Song store rejects invalid optional child IDs.
  - Audiographer delete rejects invalid parent IDs.
- Tests assert the existing validation response shape: HTTP `422`, `message: "Validation failed"`, body `statusCode: 422`, and field-level errors.

Files modified:

- `controllers/mongoDBController/contributorControllerValidation.test.js`
- `safeRefactorPlan.md`

Remaining risks:

- These tests intentionally cover validation early returns only, not successful embedded subdocument persistence.
- Runtime MongoDB integration was not exercised against a live database.

Next steps:

- Future contributor changes can add success-path tests with a controlled model/mock strategy before altering persistence behavior.
- Keep future validation changes scoped to one contributor family at a time unless frontend payload contracts are confirmed globally.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: sandboxed run failed with `spawn EPERM`; rerun outside the sandbox passed with 53 tests and 0 failures.

### Phase 11: Backend Spelling and Wording Cleanup

Goal: Fix safe spelling and wording issues across backend code without changing persisted field names, route paths, or business logic.

Allowed changes:

- Fix typo-only validation messages.
- Fix obvious user-facing response wording where behavior is unchanged.
- Clean stale comments and typo-bearing commented code.
- Do not rename persisted schema fields, request/response fields, route paths, or the `bancked/` directory.

Status: Completed.

Issues found:

- `editor_citizenshipis required` typo existed in editor validation helpers.
- Contributor list responses used `data fetch successfully`.
- Actor list catch response said `Failed to fetch Directors`.
- Contributor comments contained non-ASCII checkmark markers and stale/wrong wording such as “Add new Song” in the audiographer controller.
- `bookController.js` retained a stale commented `noresult.!!` response block.
- Several persisted/API field names are misspelled but contract-sensitive: `film_title_devnagri`, `cinemetographer`, and `title_registratin_detils`.

Fixes applied:

- Changed validation messages to `editor_citizenship is required` in:
  - `helpers/editorSchemaHelper.js`
  - `helpers/BestBookCinemaHelper.js`
- Changed contributor fetch success messages to `Data fetched successfully` in:
  - `actorController.js`
  - `producerController.js`
  - `directorController.js`
  - `songController.js`
  - `audiographerController.js`
- Corrected actor and director fetch error labels.
- Replaced non-ASCII checkmark comments with plain ASCII comments.
- Corrected stale audiographer comment wording.
- Removed stale commented `noresult.!!` block from `bookController.js`.

Files modified:

- `controllers/mongoDBController/actorController.js`
- `controllers/mongoDBController/producerController.js`
- `controllers/mongoDBController/directorController.js`
- `controllers/mongoDBController/songController.js`
- `controllers/mongoDBController/audiographerController.js`
- `controllers/mongoDBController/bookController.js`
- `helpers/editorSchemaHelper.js`
- `helpers/BestBookCinemaHelper.js`
- `safeRefactorPlan.md`

Remaining risks:

- Persisted/API field-name typos remain intentionally unchanged for compatibility.
- Some older response strings still use legacy punctuation or wording; they were left unchanged where changing them could affect frontend expectations.

Next steps:

- Rename persisted/API field typos only as a coordinated frontend/backend migration with database compatibility handling.
- Continue spelling cleanup only where response-message compatibility is understood.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: sandboxed run failed with `spawn EPERM`; rerun outside the sandbox passed with 53 tests and 0 failures.

### Phase 12: Backend Duplication Reduction Pass

Goal: Identify and eliminate safe duplicated backend logic without changing business behavior, response contracts, routes, or persisted fields.

Allowed changes:

- Reuse existing response helpers where response shape is identical.
- Extract pure validation helper utilities.
- Add focused tests for extracted helpers.
- Avoid broad controller rewrites and avoid changing user-id precedence, route paths, schema fields, or workflow steps.

Status: Completed.

Duplicate code identified:

- Repeated validation response bodies:
  - `res.status(422).json({ message: "Validation failed", errors, statusCode: 422 })`
  - Present in film, best-book, film-critic, book, and editor controllers.
- Repeated Zod error formatting:
  - `result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {})`
  - Present across auth/client, payment, contributor, book, editor, film, best-book, and film-critic helpers.
- Repeated numeric and MongoDB ObjectId checks across helper modules.
- Repeated request user-id helpers across controllers were identified but not changed in this pass because some call sites prefer `_id`, others prefer `id`, and some require string coercion.

Refactoring actions taken:

- Reused `sendValidationError()` in:
  - `controllers/mongoDBController/filmController.js`
  - `controllers/mongoDBController/bestBookController.js`
  - `controllers/mongoDBController/bestFilmCriticController.js`
  - `controllers/mongoDBController/bookController.js`
  - `controllers/mongoDBController/editorController.js`
- Added `helpers/validationCommon.js`.
  - `isNumeric()`
  - `isObjectId()`
  - `formatZodErrors()`
  - `parseZodResult()`
  - `parseZodResultWithData()`
- Added `helpers/validationCommon.test.js`.
- Updated helpers to use centralized validation utilities:
  - `helpers/clientSchemaHelper.js`
  - `helpers/contributorSchemaHelper.js`
  - `helpers/paymentSchemaHelper.js`
  - `helpers/bookSchemaHelper.js`
  - `helpers/editorSchemaHelper.js`
  - `helpers/nfaFilmHelper.js`
  - `helpers/BestBookCinemaHelper.js`
  - `helpers/bestFilmCriticHelper.js`

Before vs after:

- Before: Controllers manually repeated identical `422` validation JSON blocks.
- After: Controllers call `sendValidationError(res, errors)`, preserving the exact HTTP status and body shape.
- Before: Helper modules each reduced Zod issues into field-error objects independently.
- After: Helpers call shared parsing/formatting utilities, preserving `{ isValid, errors }` and payment helper `{ isValid, data, errors }` shapes.

Files modified:

- `controllers/mongoDBController/filmController.js`
- `controllers/mongoDBController/bestBookController.js`
- `controllers/mongoDBController/bestFilmCriticController.js`
- `controllers/mongoDBController/bookController.js`
- `controllers/mongoDBController/editorController.js`
- `helpers/validationCommon.js`
- `helpers/validationCommon.test.js`
- `helpers/clientSchemaHelper.js`
- `helpers/contributorSchemaHelper.js`
- `helpers/paymentSchemaHelper.js`
- `helpers/bookSchemaHelper.js`
- `helpers/editorSchemaHelper.js`
- `helpers/nfaFilmHelper.js`
- `helpers/BestBookCinemaHelper.js`
- `helpers/bestFilmCriticHelper.js`
- `safeRefactorPlan.md`

Remaining duplication:

- Request user-id extraction remains repeated in controllers and should be handled only in a future dedicated pass that preserves `_id`/`id` precedence and string conversion per call site.
- Contributor controllers still share structural similarities around embedded subdocument CRUD, but those flows include different arrays, field names, uploads, and response messages. A deeper extraction would need success-path tests first.
- Language-array normalization appears in multiple areas but is tied to existing field contracts and should be migrated with focused tests.

Next steps:

- Add success-path contributor tests before extracting embedded subdocument CRUD operations.
- Consider a dedicated user-id helper pass with explicit tests around `_id`/`id` precedence.
- Consider a language normalization helper only after tracing all frontend payload shapes.

Verification:

- `npm.cmd run lint`: passed with 0 warnings and 0 errors.
- Node syntax check across backend source `.js` files: passed.
- `npm.cmd test`: sandboxed run failed with `spawn EPERM`; rerun outside the sandbox passed with 57 tests and 0 failures.

## Change Log

### Phase 0

- Listed `bancked/` root directories and files.
- Read `bancked/package.json` to identify scripts and dependencies.
- Inventoried backend files with `rg --files bancked`.
- Checked backend git status.
- Read `bancked/app.js`.
- Read `bancked/server.js`.
- Read active route files:
  - `routes/mongoDBRoutes/auth.js`
  - `routes/mongoDBRoutes/filmSubmission.js`
  - `routes/mongoDBRoutes/apiRoutes.js`
- Read representative shared backend files:
  - `middleware/requireAuth.js`
  - `middleware/uploadMiddleware.js`
  - `services/common.js`
- Ran lint baseline.
- Ran Node syntax checks across backend source files.
- Ran `npm.cmd test --if-present`.
- Created `bancked/safeRefactorPlan.md`.

### Phase 1

- Updated `controllers/mongoDBController/authController.js`.
  - Changed unused catch bindings to bindingless `catch`.
  - Removed the unused assigned `user` local from the password reset update while keeping `await User.findOneAndUpdate(...)`.
- Updated `controllers/mongoDBController/bestBookController.js`.
  - Removed unused `lastId` and unused `payload` parameter from the declaration-step helper.
  - Follow-up correction: restored the declaration-step helper's second `_payload` parameter to match existing two-argument step handler calls while keeping it intentionally unused.
- Updated `controllers/mongoDBController/bestFilmCriticController.js`.
  - Removed unused `lastId` and unused `payload` parameter from the declaration-step helper.
  - Follow-up correction: restored the declaration-step helper's second `_payload` parameter to match existing two-argument step handler calls while keeping it intentionally unused.
- Updated `controllers/mongoDBController/entryListController.js`.
  - Removed unused `next` argument.
- Updated `controllers/mongoDBController/languagesController.js`.
  - Removed unused `next` argument.
- Updated `helpers/bookSchemaHelper.js`.
  - Removed unused `files` parameters from validation helpers.
- Updated `helpers/editorSchemaHelper.js`.
  - Removed unused `files` parameters from validation helpers.
- Updated `middleware/requireAuth.js`.
  - Changed unused catch binding to bindingless `catch`.
- Ran lint, syntax checks, and test discovery after changes.

### Phase 2

- Updated `package.json`.
  - Added `test` script: `node --test`.
- Added `helpers/clientSchemaHelper.test.js`.
  - Covers valid registration shape, password confirmation mismatch, invalid login email, and change-password reuse rejection.
- Added `helpers/paymentSchemaHelper.test.js`.
  - Covers numeric string IDs, Mongo ObjectId IDs, invalid form type rejection, and Razorpay confirmation validation.
- Added `services/common.test.js`.
  - Covers feature/non-feature workflow step constants, award final submit values, and persisted form/website type values.
- Added `utils/generate-otp.test.js`.
  - Covers default OTP length, custom OTP length, and unsupported length errors.
- Ran lint, syntax checks, and the new test suite.

### Phase 3

- Updated `routes/mongoDBRoutes/auth.js`.
  - Normalized imports, route quote style, and middleware spacing.
  - Removed stale commented-out inactive routes.
- Updated `routes/mongoDBRoutes/filmSubmission.js`.
  - Normalized imports, route quote style, and middleware spacing.
  - Grouped routes into feature, contributor, non-feature, and final-submit sections.
- Updated `routes/mongoDBRoutes/apiRoutes.js`.
  - Normalized imports, route quote style, and middleware spacing.
  - Grouped routes into critic, best book, book, editor, document, and payment sections.
  - Removed stale commented-out inactive editor route.
- Updated `routes/mongoDBRoutes/entryList.js`.
  - Normalized imports and route middleware spacing.
- Updated `routes/mongoDBRoutes/languages.js`.
  - Normalized imports and route middleware spacing.
- Listed route declarations with `rg -n "router\.(get|post|delete)" routes/mongoDBRoutes` to manually confirm endpoint coverage.
- Ran lint, syntax checks, and the test suite after changes.

### Phase 4

- Updated `middleware/uploadMiddleware.js`.
  - Exported `isAllowedUploadFile()` as a pure wrapper around the existing extension/MIME allow-list check.
  - Exported the existing `fileFilter` for direct tests while preserving the default Multer middleware export.
- Added `middleware/uploadMiddleware.test.js`.
  - Covers allowed upload file types, unsupported file types, and existing `fileFilter` callback/error behavior.
- Updated `services/common.js`.
  - Added a named export for the existing `imageUpload()` helper while preserving the default `Common.imageUpload` object API.
- Added `services/imageUpload.test.js`.
  - Covers sanitized filename writes, document metadata upsert shape, unsupported file rejection, and invalid document type rejection.
- Traced active upload/download references with `rg -n "imageUpload|upload\.fields|download-document|document" routes controllers services middleware -g "*.js"`.
- Ran lint, syntax checks, and the test suite after changes.

### Phase 5

- Updated `controllers/mongoDBController/authController.js`.
  - Added named exports for the existing `changePassword` and `resetPassword` handlers for direct tests.
  - Preserved the default controller export used by active routes.
- Added `controllers/mongoDBController/authController.test.js`.
  - Covers validation failure and unauthorized early-return branches without MongoDB calls.
- Updated `controllers/mongoDBController/paymentController.js`.
  - Added named exports for the existing `createOrder` and `verifyPayment` handlers for direct tests.
  - Preserved the default controller export used by active routes and compatibility aliases.
- Added `controllers/mongoDBController/paymentController.test.js`.
  - Covers validation, missing Razorpay configuration, missing secret, and invalid signature early-return branches without payment lookup/network calls.
- Updated `helpers/clientSchemaHelper.test.js`.
  - Added OTP and reset-password validation coverage.
- Updated `helpers/paymentSchemaHelper.test.js`.
  - Added optional amount/currency validation coverage.
- Traced active auth/payment route wiring and controller references with `rg -n "router\.(post|get).*user|generate-hash|confirm-payment|payment|createOrder|verifyPayment|change-password|reset-password|forgot-password|verify-otp|resend-otp" routes controllers helpers -g "*.js"`.
- Ran lint, syntax checks, and the test suite after changes.

### Phase 6

- Added `controllers/mongoDBController/responseHelper.js`.
  - Introduced `sendValidationError()` and `sendStatusMessage()` for repeated response shapes.
- Added `controllers/mongoDBController/responseHelper.test.js`.
  - Covers validation response shape, simple status message shape, and extra field preservation.
- Updated `controllers/mongoDBController/authController.js`.
  - Replaced repeated validation failure responses with `sendValidationError()`.
  - Replaced one equivalent reset-password server-error response with `sendStatusMessage()`.
- Updated `controllers/mongoDBController/paymentController.js`.
  - Replaced selected validation, configuration, authorization, duplicate-payment, and lookup responses with the response helper.
- Reviewed repeated response/error handling patterns with `rg -n "Validation failed|statusCode: 422|statusCode: 203|statusCode: 500|res\.status\(" controllers/mongoDBController helpers -g "*.js"`.
- Ran lint, syntax checks, and the test suite after changes.

### Phase 7

- Added `services/environment.js`.
  - Introduced pure startup environment validation and assertion helpers.
- Added `services/environment.test.js`.
  - Covers valid development config, missing core config, production CORS requirement, production example-JWT rejection, and combined assertion errors.
- Updated `server.js`.
  - Calls `assertStartupEnvironment()` before connecting MongoDB and running startup maintenance.
- Updated `.env.example`.
  - Added `CORS_ORIGIN`, `MAIL_SECURE`, `MAIL_SERVICE`, `ALLOW_DEV_OTP_BYPASS`, upload settings, and `REDIS_URL`.
- Traced active environment usage with `rg -n 'process\.env\.[A-Z0-9_]+' bancked -g '*.js' -g '!node_modules/**' -g '!coverage/**' -g '!public/**' -g '!storage/**'`.
- Ran lint, syntax checks, and the test suite after changes.

## Compile/Build Errors Found

No compile-time or syntax errors were found during Phase 0.

No compile-time or syntax errors were found during Phase 1.

No compile-time or syntax errors were found during Phase 2.

No compile-time or syntax errors were found during Phase 3.

No compile-time or syntax errors were found during Phase 4.

No compile-time or syntax errors were found during Phase 5.

No compile-time or syntax errors were found during Phase 6.

No compile-time or syntax errors were found during Phase 7.

Node syntax check command:

```powershell
Get-ChildItem -Recurse -Path . -Include *.js -File |
  Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\public\\' -and
    $_.FullName -notmatch '\\storage\\'
  } |
  ForEach-Object { node --check $_.FullName }
```

Result:

```text
Passed. No syntax errors reported.
```

## Lint Results

Command:

```powershell
npm.cmd run lint
```

Result:

```text
eslint .
17 warnings, 0 errors
```

Warnings found:

- `controllers/mongoDBController/authController.js`: unused catch variables and one unused `user` local.
- `controllers/mongoDBController/bestBookController.js`: unused `lastId`.
- `controllers/mongoDBController/bestFilmCriticController.js`: unused `lastId`.
- `controllers/mongoDBController/entryListController.js`: unused `next` argument.
- `controllers/mongoDBController/languagesController.js`: unused `next` argument.
- `helpers/bookSchemaHelper.js`: unused `files` arguments.
- `helpers/editorSchemaHelper.js`: unused `files` arguments.
- `middleware/requireAuth.js`: unused catch variable.

Status:

```text
Passed with warnings.
```

Phase 1 command:

```powershell
npm.cmd run lint
```

Phase 1 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

Phase 2 command:

```powershell
npm.cmd run lint
```

Phase 2 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

Phase 3 command:

```powershell
npm.cmd run lint
```

Phase 3 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

Phase 4 command:

```powershell
npm.cmd run lint
```

Phase 4 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

Phase 5 command:

```powershell
npm.cmd run lint
```

Phase 5 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

Phase 6 command:

```powershell
npm.cmd run lint
```

Phase 6 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

Phase 7 command:

```powershell
npm.cmd run lint
```

Phase 7 result:

```text
eslint .
```

Status:

```text
Passed with 0 warnings and 0 errors.
```

## Fixes Applied

Phase 0 fixes applied:

- None. This phase intentionally made no backend business logic or source-code refactor changes.

Phase 1 fixes applied:

- Removed unused bindings/parameters and unused locals identified by ESLint.
- Restored compatible helper arity for best book and film critic declaration-step handlers after static analysis detected two-argument calls.
- Kept all business behavior and response contracts unchanged.
- Verified that lint no longer reports warnings.

Phase 2 fixes applied:

- Added tests only; no backend business logic fixes were required.
- The first sandboxed test run failed with `Error: spawn EPERM` because Node's test runner tried to spawn worker processes.
- Reran `npm.cmd test` outside the sandbox; all tests passed.

Phase 3 fixes applied:

- Applied route readability-only formatting/grouping changes.
- No compile errors or lint issues were introduced.
- The sandboxed test run again failed with `Error: spawn EPERM` because Node's test runner tried to spawn worker processes.
- Reran `npm.cmd test` outside the sandbox; all tests passed.

Phase 4 fixes applied:

- Added test-only access to existing upload validation and upload helper behavior through named exports.
- Added focused tests around upload validation and document metadata persistence shape.
- Preserved the default middleware export, default `Common.imageUpload` API, route wiring, storage root conventions, response messages, and document model fields.
- The sandboxed test run again failed with `Error: spawn EPERM` because Node's test runner tried to spawn worker processes.
- Reran `npm.cmd test` outside the sandbox; all tests passed.

Phase 5 fixes applied:

- Added test-only access to existing auth and payment controller handlers through named exports.
- Added focused tests around auth validation/reset-password branches and payment order/verification early-return branches.
- Added additional Zod helper validation coverage for OTP, reset password, amount, and currency handling.
- Preserved default controller APIs, active route wiring, JWT/OTP behavior, Razorpay payload shape, and body-level `statusCode` compatibility.
- The sandboxed test run again failed with `Error: spawn EPERM` because Node's test runner tried to spawn worker processes.
- Reran `npm.cmd test` outside the sandbox; all tests passed.

Phase 6 fixes applied:

- Added a small controller response helper for repeated validation and status-message response shapes.
- Added focused tests for the helper response shapes.
- Applied the helper to selected auth/payment controller branches with existing branch coverage.
- Preserved response messages, HTTP statuses, body-level `statusCode`, extra fields, route wiring, and business behavior.
- The sandboxed test run again failed with `Error: spawn EPERM` because Node's test runner tried to spawn worker processes.
- Reran `npm.cmd test` outside the sandbox; all tests passed.

Phase 7 fixes applied:

- Added pure environment validation helpers and tests.
- Added startup validation before database connection.
- Updated `.env.example` to document active environment variables used by the backend.
- Preserved optional integration behavior and avoided hardcoded secrets.
- The sandboxed test run again failed with `Error: spawn EPERM` because Node's test runner tried to spawn worker processes.
- Reran `npm.cmd test` outside the sandbox; all tests passed.

## Unit Test Results

Command:

```powershell
npm.cmd test --if-present
```

Result:

```text
No configured test script was present. Command exited successfully without running tests.
```

Current backend test status:

- Backend unit tests are now configured through `npm.cmd test`.
- Current suite has 14 test files and 57 tests.

Phase 1 test command:

```powershell
npm.cmd test --if-present
```

Phase 1 result:

```text
No configured test script was present. Command exited successfully without running tests.
```

Phase 2 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 15
pass 15
fail 0
duration_ms 828.8591
```

Phase 3 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 15
pass 15
fail 0
duration_ms 618.4583
```

Phase 4 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 22
pass 22
fail 0
duration_ms 770.2296
```

Phase 5 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 35
pass 35
fail 0
duration_ms 1092.8792
```

Phase 6 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 38
pass 38
fail 0
duration_ms 955.5345
```

Phase 7 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 43
pass 43
fail 0
duration_ms 1018.8542
```

Phase 8 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 44
pass 44
fail 0
duration_ms 1214.3056
```

Phase 9 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 48
pass 48
fail 0
duration_ms 1266.4805
```

Phase 10 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 53
pass 53
fail 0
duration_ms 1501.6424
```

Phase 12 test command:

```powershell
npm.cmd test
```

Initial sandbox result:

```text
Error: spawn EPERM
```

Final result after rerun outside the sandbox:

```text
tests 57
pass 57
fail 0
duration_ms 1820.9577
```

## Any Unresolved Issues

- ESLint warnings from Phase 0 have been resolved.
- Backend unit test script now exists.
- Runtime behavior was not smoke-tested against MongoDB in this phase.
- Uploaded files under `public/documents/` and `storage/documents/` remain runtime artifacts and were not inspected as source.
- Future refactors must continue preserving:
  - route prefixes and endpoint names
  - body-level `statusCode`
  - auth middleware behavior
  - `multer.memoryStorage()` upload flow
  - `Common.imageUpload()` persistence behavior
  - workflow step constants in `services/common.js`

## Final Validation Status

- Phase 0 review completed.
- Phase 1 lint-warning cleanup completed.
- Phase 2 helper and validation test harness completed.
- Phase 3 route readability pass completed.
- Phase 4 upload and document safety pass completed.
- Phase 5 auth and payment safety pass completed.
- Phase 6 response helper safety pass completed.
- Phase 7 environment documentation and production safety pass completed.
- Backend plan file created.
- No business logic, auth/payment behavior, response contract, upload storage behavior, or optional integration behavior changed.
- Lint passed with 0 warnings and 0 errors.
- Node syntax checks passed.
- Unit tests passed: 57 tests across 14 files.
- Current phase is error-free for compile/syntax checks.
