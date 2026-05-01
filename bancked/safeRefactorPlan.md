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

## Pending Tasks

- Add a real backend test script and focused Node/Vitest/Jest test harness if a backend test dependency is intentionally introduced.
- Add focused tests around:
  - auth validation and password reset flows
  - Zod helper validation
  - workflow step progression
  - upload validation and document metadata behavior
  - payment order/verification helpers
- Review controller files for repeated response/error handling patterns before extracting shared helpers.
- Review route formatting and middleware spacing without changing route names or middleware order.
- Review environment variable documentation and production safety checks.

## Current Phase

Current phase: Phase 1, Lint Warning Cleanup.

Status: Completed.

Phase 1 scope:

- Remove lint warnings only.
- No business logic changes.
- No route/controller/model/helper behavior changes.
- No runtime artifact edits.

## Next Step

Begin Phase 2: add a focused backend test harness around pure helpers/validation before making higher-risk controller, auth, payment, upload, or workflow-step changes.

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

Status: Pending.

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

Status: Pending.

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

Status: Pending.

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

Status: Pending.

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
- Updated `controllers/mongoDBController/bestFilmCriticController.js`.
  - Removed unused `lastId` and unused `payload` parameter from the declaration-step helper.
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

## Compile/Build Errors Found

No compile-time or syntax errors were found during Phase 0.

No compile-time or syntax errors were found during Phase 1.

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

## Fixes Applied

Phase 0 fixes applied:

- None. This phase intentionally made no backend business logic or source-code refactor changes.

Phase 1 fixes applied:

- Removed unused bindings/parameters and unused locals identified by ESLint.
- Kept all business behavior and response contracts unchanged.
- Verified that lint no longer reports warnings.

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

- No backend unit test suite is currently configured in `package.json`.
- No test failures were found because no tests were run.
- Adding a focused backend test harness is pending.

Phase 1 test command:

```powershell
npm.cmd test --if-present
```

Phase 1 result:

```text
No configured test script was present. Command exited successfully without running tests.
```

## Any Unresolved Issues

- ESLint warnings from Phase 0 have been resolved.
- No backend unit test script exists.
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
- Backend plan file created.
- No business logic changed.
- Lint passed with 0 warnings and 0 errors.
- Node syntax checks passed.
- Unit test command discovery completed; no test suite configured.
- Current phase is error-free for compile/syntax checks.
