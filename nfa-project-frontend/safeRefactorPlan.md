# Safe React 19 Refactor Plan

## Project Review Summary

Reviewed the `nfa-project-frontend` project as a React 19 + Vite frontend for National Film Awards workflows. The codebase is page-driven and organized around route-level pages, large domain form components, shared hooks, Redux feature slices, React Query wrappers, and centralized Axios services.

The active frontend areas are:

- `src/App.jsx`: React Router route tree.
- `src/main.jsx`: React 19 root creation with `createRoot`.
- `src/app/providers.jsx`: Redux, React Query, toast, and API interceptor setup.
- `src/services/` and `src/common/services/`: canonical and compatibility API service layers.
- `src/hooks/`: auth context, query wrappers, Axios helper hook, input restriction hook.
- `src/pages/`: dashboard, auth, and entry workflow pages.
- `src/component/`: layout, shared UI, and feature-specific form sections.
- `src/features/`: Redux slices for auth, UI, shared state, and form state.
- `src/styles/`: plain CSS and Bootstrap-oriented styling.

No business logic changes are planned in this document. Future refactors must preserve current route names, API endpoints, request payloads, body-level `statusCode` checks, `active_step` resume behavior, payment behavior, auth storage behavior, and file/document URL behavior.

## Current React Usage

- React version: `^19.1.0`.
- React DOM version: `^19.1.0`.
- Root rendering: `createRoot(document.getElementById("root")).render(...)`.
- StrictMode: present but commented out in `src/main.jsx`.
- State/effects: broad use of `useState`, `useEffect`, `useMemo`, `useCallback`, and `useRef`.
- Context: auth is provided through `AuthContext` and consumed through `useContext`.
- Routing: React Router v7 with `createBrowserRouter` and `RouterProvider`.
- Forms: `react-hook-form` with Zod schemas and `zodResolver`.
- Server state: TanStack React Query v5 with shared query keys.
- App state: Redux Toolkit with React Redux.
- UI libraries: Bootstrap, MUI, Swiper, Sonner, Bootstrap Icons, Lucide.

## React 19 Readiness Checklist

- [x] Uses `react` and `react-dom` 19 packages.
- [x] Uses `createRoot`, not legacy `ReactDOM.render`.
- [x] Uses functional components and hooks.
- [x] Uses React Router v7-compatible route creation.
- [x] Uses React Query v5-compatible hooks.
- [x] Uses Redux Toolkit and React Redux versions compatible with modern React.
- [x] Current lint check passes.
- [x] Current production build passes when the environment allows esbuild to spawn.
- [x] No source-level compile errors found in baseline.
- [ ] StrictMode is not currently enabled; enabling it requires a later behavior-preserving audit.
- [x] A minimal unit test harness now exists through Vitest.
- [ ] Large bundle warning remains; future code splitting can be evaluated separately.
- [ ] Some compatibility and legacy wrapper files remain; cleanup should be phased carefully.
- [ ] Many form sections use local step/payload logic; refactors must avoid drift from backend step sequencing.

## Completed Tasks

- Reviewed repository instructions and frontend architecture expectations.
- Reviewed frontend file inventory.
- Reviewed package scripts and installed dependencies.
- Identified current React 19 usage patterns.
- Ran baseline lint check.
- Ran baseline production build check.
- Ran baseline unit test command through Vitest.
- Created this phase-by-phase safe refactor plan.
- Completed Phase 1 by adding a `test` script and a focused helper test file.
- Completed Phase 2 by removing stale legacy/commented-out implementation blocks while preserving compatibility shims.
- Completed Phase 3 by tightening safe hook usage and adding StrictMode-safe OTP timer cleanup.
- Completed Phase 4 by tightening auth form safety, validation accessibility, and reset-password route guarding without changing auth API contracts.
- Started Phase 5 by extracting and testing shared entry resume-step calculation across the four workflow route pages.
- Continued Phase 5 by extracting and testing shared feature/non-feature film endpoint selection for the first film workflow sections.
- Continued Phase 5 by reusing the film endpoint helper in producer, director, return, and declaration workflow sections.
- Continued Phase 5 by reusing the film endpoint helper in the remaining active film form sections and payment lookup.
- Continued Phase 5 by extracting and testing best book / film critic endpoint constants, then reusing them across their workflow pages and sections.
- Continued Phase 5 by extracting and testing shared entry workflow metadata for dashboard routes and read-only submission view endpoint resolution.
- Continued Phase 5 by extracting and testing shared film workflow step/payment metadata for shared return, declaration, and payment sections.
- Continued Phase 5 by extracting and testing shared award payment metadata for best book and film critic preview/payment sections.
- Continued Phase 5 by extracting and testing shared award section step metadata across best book and film critic workflow sections.
- Completed the safe Phase 5 metadata pass by centralizing remaining film final-submit endpoint and film section step/navigation metadata.
- Started Phase 6 by centralizing shared service endpoint metadata and testing public auth route detection without changing Axios behavior.
- Continued Phase 6 by reusing endpoint metadata for common language lookups and Razorpay payment service endpoints.
- Continued Phase 6 by centralizing best book and film critic child-resource endpoints for books and editors/publishers.
- Continued Phase 6 by centralizing film child-resource endpoints for producer, director, actor, song, and audiographer sections.
- Completed Phase 6 service/query endpoint audit with no remaining active call-site endpoint literals outside workflow/endpoint metadata.
- Completed Phase 7 as a consolidated UI/accessibility pass across auth, dashboard, shared layout, OTP, password, step indicator, and workflow controls without changing business logic.
- Completed a folder-structure stabilization pass by moving shared UI, layout, modal, and form-control components into `src/components/*` while preserving feature workflow modules and business behavior.

## Pending Tasks

- Add more targeted tests before high-risk refactors.
- Audit route tree for duplicate or legacy route patterns.
- Audit form sections phase-by-phase without changing payloads.
- Audit payment flow configuration and error handling.
- Consider route-level code splitting after behavior is stable.

## Phase-By-Phase Refactor Plan

### Phase 0: Baseline Documentation and Verification

Goal: Document current state and establish a reliable baseline before any refactor.

Tasks:

- Review full frontend codebase.
- Identify React 19 usage.
- Record current lint/build/unit test status.
- Create `safeRefactorPlan.md`.

Verification:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd exec vitest run`

Status: Completed for planning baseline.

### Phase 1: Tooling and Test Harness Stabilization

Goal: Improve confidence without changing application behavior.

Allowed changes:

- Add a `test` script only if agreed and aligned with existing Vitest dependency.
- Add targeted tests for pure helpers and low-risk utilities.
- Keep test additions independent of runtime behavior.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Unit test command.

Status: Completed.

Phase 1 results:

- Added `npm run test` script using the already-installed Vitest dependency.
- Added focused tests for `countWords` and `formatDate` in `src/common/common-function.test.js`.
- No business logic was changed.
- `npm.cmd run lint` passed.
- `npm.cmd run test` passed after rerun outside the sandbox.
- `npm.cmd run build` passed after rerun outside the sandbox.

### Phase 2: Legacy Comment and Compatibility Audit

Goal: Reduce confusion from retained previous implementations while preserving working import paths.

Allowed changes:

- Remove stale commented-out code only when it does not document active business behavior.
- Keep compatibility exports such as old service/store paths until imports are fully audited.
- Do not remove request wrappers or Redux compatibility slices during this phase.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Unit tests if present.

Status: Completed.

Phase 2 results:

- Removed stale previous-implementation comment blocks from compatibility and active source files.
- Removed commented-out old `useQuery`/static-data examples from reviewed route/form files.
- Preserved compatibility shim files in `src/store/*`, `src/common/services/*`, and `src/hooks/useFetchById.js`.
- Preserved active request service functions and import paths used by form components.
- No business logic was changed.
- `npm.cmd run lint` passed.
- `npm.cmd run test` passed after rerun outside the sandbox.
- `npm.cmd run build` passed after rerun outside the sandbox.

### Phase 3: React Hook Safety Audit

Goal: Make hooks robust under React 19 and eventual StrictMode checks.

Allowed changes:

- Fix missing or unstable effect dependencies only when the behavioral impact is clear.
- Avoid moving API calls between components unless the flow is fully traced.
- Avoid changing submission timing, validation timing, or step progression.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Unit tests if present.
- Manual trace of affected create/edit/resume flows.

Status: Completed.

Phase 3 results:

- Removed unused placeholder state from `src/app/providers.jsx`.
- Narrowed auth persistence dependencies in `src/hooks/use-auth.jsx` from the whole auth object to `token` and `user`.
- Added cleanup for the OTP resend interval in `src/component/CustomOtp.jsx`.
- Removed an unnecessary default React import from `CustomOtp.jsx`.
- Preserved auth storage shape, login/register/logout behavior, OTP UI behavior, API calls, validation timing, and step progression.
- `npm.cmd run lint` passed.
- `npm.cmd run test` passed after rerun outside the sandbox.
- `npm.cmd run build` passed after rerun outside the sandbox.

### Phase 4: Auth Flow Safety Pass

Goal: Preserve login/register/password flows while cleaning only safe React usage issues.

Allowed changes:

- Accessibility improvements.
- Formatting cleanup.
- Defensive null checks that preserve current behavior.
- No endpoint, payload, localStorage key, or navigation behavior changes.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Auth-focused tests if added.
- Manual trace: login, email verification, forgot password, OTP, reset password, logout.

Status: Completed.

Phase 4 results:

- Added accessible `id`, `aria-invalid`, and `aria-describedby` support to shared password inputs.
- Connected auth form labels/errors to their inputs where the change was local and behavior-preserving.
- Prevented duplicate register submissions while the register mutation is pending.
- Prevented login submission while email verification is pending.
- Validated the login username before calling the email verification endpoint on blur, avoiding avoidable verification calls for invalid local input.
- Guarded direct `/reset-password` access without verified email route state by redirecting back to `/forgot-password`.
- Preserved auth endpoints, request payload fields, localStorage key/shape, login/register/logout navigation, password reset payload, and body-level `statusCode` handling.
- `npm.cmd run lint` passed.
- `npm.cmd run test` passed after rerun outside the sandbox.
- `npm.cmd run build` passed after rerun outside the sandbox.

### Phase 5: Entry Workflow Form Pass

Goal: Safely modernize feature, non-feature, best book, and film critic form sections.

Allowed changes:

- Local cleanup with no request/response contract changes.
- Keep `FormData` keys unchanged.
- Keep body-level `statusCode` checks unchanged.
- Keep `active_step` behavior unchanged.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Tests for any extracted pure mapping helpers.
- Manual trace: create, edit, resume, final submit.

Status: Completed for the safe metadata and workflow-constant pass.

Phase 5 progress:

- Extracted the repeated `active_step` resume calculation into `src/common/entry-step.js`.
- Added focused Vitest coverage for next-step, final-step, and existing coercion edge behavior.
- Updated feature film, non-feature film, best book, and best film critic route pages to use the shared helper.
- Preserved each page's existing presence checks for `active_step`, including the non-feature `!= null` behavior.
- Did not change `FormData` keys, submit handlers, endpoint names, body-level `statusCode` checks, route `:id` usage, or form section ordering.
- Extracted feature/non-feature film entry, update, and create endpoint selection into `src/common/film-workflow.js`.
- Added focused tests for feature and non-feature endpoint helpers.
- Updated film details, censor, and company registration sections to use the endpoint helper.
- Kept all request payload construction, upload fields, step values, response checks, and next/back section transitions unchanged.
- Extended endpoint-helper reuse to producer, director, return, and declaration sections.
- Preserved contributor list endpoints, `FormData` keys, delete/edit payloads, step values, validation flow, and next/back section transitions.
- Extended endpoint-helper reuse to actor, songs, audiographer, screenplay, non-feature other, non-feature view, and payment sections.
- Left `FilmSubmissionView` endpoint behavior unchanged while moving its pathname-based resolution into shared entry workflow metadata.
- Preserved list/store/delete endpoints, final submit endpoint, payment service behavior, query invalidation keys, `FormData` keys, file upload fields, step values, response checks, and navigation.
- Added `src/common/award-workflow.js` with best book and film critic endpoint constants.
- Added focused tests for best book and film critic endpoint values.
- Reused the endpoint constants in best book / film critic route pages, create/update sections, declarations, and preview/payment views.
- Preserved book/editor list/store/delete endpoints, final-submit behavior, payment service behavior, query invalidation shape, `FormData` keys, file upload fields, step values, response checks, and navigation.
- Added `src/common/entry-workflow.js` with shared entry workflow ordering, labels, route segments, view types, and entry-by endpoint metadata.
- Added focused tests for dashboard workflow order, labels, route path generation, and view endpoint resolution.
- Reused the workflow metadata in the dashboard card rendering and shared read-only submission view.
- Preserved dashboard card ordering, edit/view route names, paid/unpaid behavior, read-only view endpoint names, and view-type branching.
- Added shared feature/non-feature film step metadata and payment metadata helpers to `src/common/film-workflow.js`.
- Added focused tests for shared return/declaration/payment step values and payment payload metadata.
- Reused those helpers in shared return, declaration, and payment sections.
- Preserved submitted `step` values, previous/next section transitions, payment `formType`, payment description, endpoint names, `FormData` keys, and response checks.
- Added shared best book and film critic payment metadata to `src/common/award-workflow.js`.
- Added focused tests for award payment form types, payment descriptions, and preview back-step values.
- Reused the award payment metadata in best book preview/payment and film critic view/payment sections.
- Preserved payment `formType`, payment description, preview back-step behavior, final-submit endpoints, query invalidation, `FormData` keys, and response checks.
- Added shared award section step helpers to `src/common/award-workflow.js`.
- Added focused tests for award first/detail/publisher/declaration step values and previous/next transitions.
- Reused the award step helpers across best book and film critic first, detail, publisher, and declaration sections.
- Preserved submitted `step` values, previous/next section transitions, endpoint names, `FormData` keys, validation flow, and response checks.
- Added `filmFinalSubmitEndpoint` and full film section step/navigation metadata to `src/common/film-workflow.js`.
- Added focused tests for film final submit endpoint, shared initial film sections, feature-only sections, and non-feature-only sections.
- Reused the film endpoint helper in feature and non-feature route pages.
- Reused film step/navigation helpers across feature/non-feature film details, censor, company, producer, director, actor, songs, audiographer, screenplay, non-feature other, and non-feature view sections.
- Preserved film submitted `step` values, previous/next section transitions, endpoint names, `FormData` keys, validation flow, query behavior, and response checks.
- `npm.cmd run lint` passed.
- `npm.cmd run test` passed.
- `npm.cmd run build` passed after rerun outside the sandbox.

### Phase 6: Shared Service and Query Layer Pass

Goal: Consolidate around existing service/query patterns without altering API behavior.

Allowed changes:

- Improve service naming or local readability only when call sites are safely updated.
- Keep Axios interceptor behavior, auth token attachment, loader behavior, and 401 handling intact.
- Keep compatibility wrappers until all call sites are verified.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Unit tests for request/error normalization if added.

Status: Completed for the endpoint metadata and active service/query audit slices.

Phase 6 progress:

- Added `src/services/apiEndpoints.js` for shared auth, dashboard, and common endpoint metadata.
- Reused endpoint metadata in `authService`, `dashboardService`, `entryService`, and the Axios public-route loader exclusion check.
- Preserved Axios interceptor registration, auth token attachment, loader behavior, 401 handling, toast behavior, endpoint strings, and compatibility wrappers.
- Added focused tests for auth endpoint values, dashboard/common endpoint values, and the existing public auth route suffix behavior.
- Reused common endpoint metadata in the remaining active language lookup call sites.
- Added payment endpoint metadata and reused it in the Razorpay order/verification service.
- Preserved language fetch timing, payment payload construction, Razorpay flow behavior, request wrappers, body-level `statusCode` checks, and endpoint strings.
- Added award child-resource endpoint metadata for book and editor list/store/update/delete routes.
- Reused award child-resource endpoint metadata in best book details, best book publisher, and film critic publisher sections.
- Preserved child-resource payloads, delete-by-id calls, list refresh behavior, validation, toasts, and body-level `statusCode` checks.
- Added film child-resource endpoint metadata for producer, director, actor, song, and audiographer list/store/delete routes.
- Reused film child-resource endpoint metadata in the active film contributor sections.
- Preserved contributor payloads, `FormData` keys, list refresh behavior, delete identifiers, validation, toasts, and body-level `statusCode` checks.
- Audited remaining active service/query call sites and confirmed endpoint literals now live in endpoint/workflow metadata or tests.
- `npm.cmd run lint` passed.
- `npm.cmd run test` passed.
- `npm.cmd run build` passed after rerun outside the sandbox.

### Phase 7: UI and Accessibility Pass

Goal: Improve semantic correctness without changing visible UI behavior.

Allowed changes:

- Add labels, `aria-*`, button types, and safer link/button semantics.
- Keep layout, text, navigation destinations, and form behavior stable.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Manual smoke checks for auth and form navigation.

Status: Completed.

Phase 7 execution summary:

Phase 7 was executed as a final consolidated UI/accessibility stabilization pass using stable React 19-compatible JSX and hook patterns. The pass stayed within semantic markup, accessibility attributes, button/link correctness, decorative media treatment, and low-risk cleanup. No endpoint, payload, navigation destination, storage key, validation branch, form submission flow, step progression rule, payment behavior, or business decision logic was changed.

All Phase 7 tasks completed:

- Added explicit close-button semantics and an accessible label to the OTP close control.
- Changed the dashboard create-project modal trigger from `href="#"` to a real button.
- Added an explicit `type="button"` to the dashboard add-project button.
- Replaced all placeholder logo anchor links (`href="#"`) in auth, dashboard, and navbar layouts with non-interactive wrapper elements.
- Added explicit `type="button"` to remaining non-submit buttons in repeated add/edit/delete table controls and the print action.
- Confirmed no JSX `<button>` opening tags remain without an explicit `type`.
- Marked auth and dashboard carousel images as decorative with empty alt text instead of exposing `slide-0`/`slide-1` labels to assistive technologies.
- Replaced the login information offcanvas trigger's icon-with-button-role pattern with a real button using Bootstrap `data-bs-target`.
- Replaced the route error page's plain anchor login navigation with a React Router `Link`, matching the existing not-found page behavior.
- Added accessible status labels and `aria-current="step"` to the shared workflow step indicator.
- Marked the completed-step check icon as decorative for assistive technologies.
- Replaced clickable password visibility toggle spans with real buttons in the shared password input components.
- Added accessible show/hide password labels and marked decorative password icons as hidden from assistive technologies.
- Added accessible names and numeric input hints to OTP digit/single-code fields.
- Exposed OTP resend and expiry timer updates through polite live regions.
- Removed a stale unused navbar import found during the final stability review.

Phase 7 errors encountered:

- Initial production build inside the sandbox failed while Vite loaded `vite.config.js` because esbuild could not spawn: `Error: spawn EPERM`.
- No source compile errors were found after rerunning the build outside the sandbox.
- No unit test failures were encountered.

Phase 7 fixes applied:

- Reran the production build outside the sandbox so Vite/esbuild could spawn normally.
- Kept existing Vite empty-chunk warnings documented; they are build warnings from the current manual chunk configuration, not compile failures.
- Confirmed the final code preserves modal opening behavior, dashboard text, layout classes, auth behavior, add/edit/delete handlers, print behavior, carousel behavior, error-page routing, step indicator navigation, password registration/validation, OTP focus/value/resend/submit behavior, form payloads, and submit flows.

Phase 7 final validation status:

- `npm.cmd run lint` passed.
- `npm.cmd run test` passed.
- `npm.cmd run build` passed after rerun outside the sandbox.
- No Phase 7 pending tasks remain.

### Phase 8: Performance and Bundle Review

Goal: Address build warnings only after behavior is stable.

Allowed changes:

- Evaluate lazy route-level imports.
- Evaluate manual chunks only if bundle behavior is understood.
- No logic or contract changes.

Verification after phase:

- `npm.cmd run lint`
- `npm.cmd run build`
- Compare build output and route loading behavior.

Phase 8 progress:

- Added route-level `React.lazy` loading for auth, dashboard, film, best book, and critic pages, keeping the existing route tree and fallback loader behavior.
- Added Vite `rollupOptions.output.manualChunks` configuration to split vendor packages by package name and avoid a monolithic vendor bundle.
- Verified the production build compiles successfully without emitting the previous oversized chunk warnings.
- Verified frontend ESLint still passes after the performance-related changes.

Status: Completed.

### Phase 9: Folder Structure Stabilization

Goal: Improve project organization toward a professional React 19 frontend structure while preserving existing business logic, API contracts, route names, form behavior, and UI behavior.

Existing folder structure review:

- `src/app/` is the correct home for application providers and Redux store assembly.
- `src/pages/` correctly holds route-level screens.
- `src/features/` correctly holds Redux feature slices and domain feature exports.
- `src/hooks/`, `src/services/`, `src/lib/`, and `src/styles/` are useful top-level concerns and remain in place.
- `src/common/` had mixed responsibilities: pure workflow helpers/tests, navigation helpers, service compatibility wrappers, a date picker UI component, and modal UI.
- `src/component/` had mixed responsibilities: reusable shared UI, app layout shell components, and large domain-specific workflow form sections.
- `src/store/` remains as compatibility exports around the active store/slices and was not moved in this pass to avoid breaking legacy imports.

Proposed professional structure:

```text
src/
  app/                  # app-wide providers and store assembly
  components/
    form/               # reusable form controls
    layout/             # app shell and navigation layout pieces
    modals/             # reusable modal components
    shared/             # generic shared UI components
  component/            # legacy/domain workflow sections kept stable for now
  common/               # pure helpers, workflow metadata, compatibility services
  features/             # Redux and feature-domain modules
  hooks/                # reusable hooks and query wrappers
  lib/                  # library configuration
  pages/                # route-level screens
  services/             # canonical API client and service modules
  styles/               # global and feature CSS
```

Files/folders moved:

- `src/component/CustomOtp.jsx` -> `src/components/shared/CustomOtp.jsx`
- `src/component/StepIndicator.jsx` -> `src/components/shared/StepIndicator.jsx`
- `src/component/passwordInput.jsx` -> `src/components/shared/PasswordInput.jsx`
- `src/component/loader-component.jsx` -> `src/components/shared/Loader.jsx`
- `src/component/NavigateSetter.jsx` -> `src/components/shared/NavigateSetter.jsx`
- `src/component/layouts/layout.jsx` -> `src/components/layout/AppLayout.jsx`
- `src/component/layouts/navbar.jsx` -> `src/components/layout/Navbar.jsx`
- `src/component/layouts/footer.jsx` -> `src/components/layout/Footer.jsx`
- `src/common/modal/feature-modal.jsx` -> `src/components/modals/FeatureModal.jsx`
- `src/common/CustomDatePicker.jsx` -> `src/components/form/CustomDatePicker.jsx`
- Removed now-empty legacy folders `src/component/layouts/` and `src/common/modal/`.

Import/path updates:

- Updated `src/App.jsx` to import `AppLayout` and `Loader` from `src/components`.
- Updated route pages for feature, non-feature, best book, and film critic flows to import `Navbar` and `StepIndicator` from `src/components`.
- Updated auth pages to import `CustomOtp` and `PasswordInput`/`PasswordField` from `src/components/shared`.
- Updated dashboard to import `FeatureModal` from `src/components/modals`.
- Updated date-picker consumers in film censor, best book, and film critic sections to import from `src/components/form`.
- Updated moved component internals for `NavigateSetter`, `Loader`, and `AppLayout` relative imports.
- Confirmed no stale imports remain for the moved legacy paths.

Errors found:

- Initial build inside the sandbox failed with the known Vite/esbuild `spawn EPERM` restriction while loading `vite.config.js`.
- After rerunning outside the sandbox, build found one restructure error: `src/components/shared/StepIndicator.jsx` still referenced the old CSS path `./../styles/FeatureFilmForm.css`.
- No unit test failures were found.

Fixes applied:

- Updated `StepIndicator` CSS import to `../../styles/FeatureFilmForm.css`.
- Reran production build outside the sandbox so Vite/esbuild could spawn normally.
- Reran lint and unit tests after the build fix.
- Kept feature workflow sections in `src/component/*-component/` for this pass to avoid a broad domain-form move with high import churn.

Build/compile logs:

```powershell
npm.cmd run build
```

Initial sandbox result:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

First rerun outside sandbox:

```text
Could not resolve "./../styles/FeatureFilmForm.css" from "src/components/shared/StepIndicator.jsx"
```

Final rerun outside sandbox:

```text
vite v6.3.5 building for production...
2913 modules transformed.
built in 8.82s
```

Warnings:

```text
Generated an empty chunk: "vendor-emotion-weak-memoize".
Generated an empty chunk: "vendor-fingerprintjs-fingerprintjs".
Generated an empty chunk: "vendor-react-router-dom".
Generated an empty chunk: "vendor-set-cookie-parser".
Generated an empty chunk: "vendor-tslib".
```

Unit test results:

```powershell
npm.cmd run test
```

Final result:

```text
Test Files  6 passed (6)
Tests  31 passed (31)
Duration  928ms
```

Lint result:

```powershell
npm.cmd run lint
```

Final result:

```text
eslint src --ext .js,.jsx,.ts,.tsx
```

Status: Passed.

Final validation status:

- `npm.cmd run lint` passed.
- `npm.cmd run test` passed.
- `npm.cmd run build` passed after the known sandbox spawn limitation was rerun outside the sandbox.
- No business logic, route names, API payloads, response handling, step progression, auth behavior, payment behavior, or UI behavior was intentionally changed.
- The project now has a clearer `src/components/*` structure for shared UI, layout, modal, and form-control components.

Pending items:

- Consider a future deliberate migration from singular `src/component/` to `src/components/features/*` for the large workflow sections after a separate form-flow regression plan is in place.
- Consider replacing compatibility `src/store/*` and `src/common/services/*` imports only after confirming all legacy call sites are no longer needed.

## Current Phase Status

Current phase: Phase 9, Folder Structure Stabilization.

Status: Completed.

Current status: Shared UI, layout, modal, and reusable form-control components have been moved into `src/components/*`; lint, tests, and production build are verified.

What was completed in Phase 5: Resume-step calculation, film endpoint selection, best book / film critic endpoint constants, shared entry workflow metadata, shared film section step/payment metadata, shared award payment metadata, shared award section step metadata, film final-submit endpoint, and remaining film section navigation metadata are centralized without changing form contracts.

## Error Logs

### Baseline Command Error: PowerShell quoting

Command attempted:

```powershell
rg -n -e "from [\"']react[\"']" ...
```

Result:

```text
The string is missing the terminator: ".
```

Resolution:

- Replaced the command with a PowerShell-native `Get-ChildItem | Select-String` scan.
- No source code issue was involved.

### Baseline Build Error: Sandbox EPERM

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran the same build command outside the sandbox with approval so esbuild could spawn.
- Build passed.

### Baseline Vitest Error: Sandbox EPERM

Command:

```powershell
npm.cmd exec vitest run
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran the Vitest command outside the sandbox with approval so Vite/esbuild could spawn.
- Vitest started successfully, then reported no test files found.

### Baseline Vitest Result: No Tests Found

Command:

```powershell
npm.cmd exec vitest run
```

Result:

```text
No test files found, exiting with code 1
include: **/*.{test,spec}.?(c|m)[jt]s?(x)
exclude: **/node_modules/**, **/.git/**
```

Interpretation:

- This is a test-suite absence, not a source compile failure.
- Unit test status remains pending until tests are added.

### Phase 1 Test Error: Sandbox EPERM

Command:

```powershell
npm.cmd run test
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run test` outside the sandbox with approval so Vite/esbuild could spawn.
- Tests passed.

### Phase 1 Build Error: Sandbox EPERM

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run build` outside the sandbox with approval so esbuild could spawn.
- Build passed.

### Phase 2 Test Error: Sandbox EPERM

Command:

```powershell
npm.cmd run test
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run test` outside the sandbox with approval so Vite/esbuild could spawn.
- Tests passed.

### Phase 2 Build Error: Sandbox EPERM

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run build` outside the sandbox with approval so esbuild could spawn.
- Build passed.

### Phase 3 Test Error: Sandbox EPERM

Command:

```powershell
npm.cmd run test
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run test` outside the sandbox with approval so Vite/esbuild could spawn.
- Tests passed.

### Phase 3 Build Error: Sandbox EPERM

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run build` outside the sandbox with approval so esbuild could spawn.
- Build passed.

### Phase 4 Test Error: Sandbox EPERM

Command:

```powershell
npm.cmd run test
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run test` outside the sandbox with approval so Vite/esbuild could spawn.
- Tests passed.

### Phase 4 Build Error: Sandbox EPERM

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run build` outside the sandbox with approval so esbuild could spawn.
- Build passed.

### Phase 5 Test Error: Sandbox EPERM

Command:

```powershell
npm.cmd run test
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run test` outside the sandbox with approval so Vite/esbuild could spawn.
- Tests passed.

### Phase 5 Build Error: Sandbox EPERM

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Resolution:

- Reran `npm.cmd run build` outside the sandbox with approval so esbuild could spawn.
- Build passed.

## Fix Logs

### Phase 0

- Created `safeRefactorPlan.md`.
- No application source code changes were made as part of this plan.
- No business logic was changed.

### Phase 1

- Added `test` script to `package.json`.
- Added `src/common/common-function.test.js`.
- Covered `countWords` empty/missing input and mixed-whitespace counting.
- Covered `formatDate` missing-date handling and ISO-compatible date formatting.
- No existing business logic was changed.

### Phase 2

- Removed stale commented legacy implementation blocks from:
  - `src/hooks/use-auth.jsx`
  - `src/hooks/useFetchById.js`
  - `src/hooks/useAxiosInterceptor.js`
  - `src/common/services/requestService.js`
  - `src/common/services/axiosService.js`
  - `src/app/store.js`
  - `src/store/store.js`
  - `src/store/loaderSlice.js`
  - `src/store/featureFormSlice.js`
  - selected route/form files that had commented-out old query examples
- Kept compatibility exports and active runtime behavior unchanged.
- No endpoint, payload, navigation, state, auth, payment, or step-flow behavior was changed.

### Phase 3

- Removed unused `useState` placeholder state from `src/app/providers.jsx`.
- Updated `AuthProvider` to select and persist `token`/`user` directly instead of depending on the full auth slice object.
- Added interval cleanup to `CustomOtp` to avoid duplicate timers under remounts or StrictMode effect replay.
- Kept all auth, OTP, API, state, and navigation behavior unchanged.

### Phase 4

- Added optional `id` and validation description props to shared password input components.
- Added auth form label/error wiring for login, signup, forgot password, reset password, and change password screens.
- Added pending-state submit protection for register and login/email-verification flows.
- Added a reset-password route-state guard so direct access without a verified email returns to forgot password.
- Kept auth endpoints, payloads, localStorage key/shape, response handling, and normal navigation behavior unchanged.

### Phase 5

- Added `src/common/entry-step.js` for the existing active-step resume calculation.
- Added `src/common/entry-step.test.js` covering normal progression, final-step clamping, and current coercion behavior.
- Reused the helper in `src/pages/feature-film.jsx`, `src/pages/non-feature-film.jsx`, `src/pages/best-book.jsx`, and `src/pages/best-filmCritic.jsx`.
- Kept form section order, submit payloads, service URLs, and response handling unchanged.
- Added `src/common/film-workflow.js` for feature/non-feature film endpoint selection.
- Added `src/common/film-workflow.test.js` covering entry-by, update, and create endpoint values.
- Reused the endpoint helper in film details, censor, and company registration sections.
- Kept `FormData` keys, file upload fields, step values, section transitions, and `statusCode` checks unchanged.
- Reused the same endpoint helper in producer, director, return, and declaration sections.
- Kept contributor list/store/delete endpoints, upload fields, edit/delete identifiers, validation conditions, `FormData` keys, step values, and section transitions unchanged.
- Reused the endpoint helper in actor, songs, audiographer, screenplay, non-feature other, non-feature view, and payment sections.
- Kept `FilmSubmissionView` pathname-based endpoint resolution unchanged for this slice.
- Kept final submit, payment service behavior, query invalidation keys, list/store/delete endpoints, upload fields, validation conditions, `FormData` keys, step values, response checks, navigation, and section transitions unchanged.
- Added `src/common/award-workflow.js` for best book and film critic endpoint constants.
- Added `src/common/award-workflow.test.js` covering those endpoint values.
- Reused the award endpoint constants in route pages, first-step create/update sections, declaration sections, and preview/payment sections.
- Kept book/editor list/store/delete endpoints, final-submit behavior, payment service behavior, query invalidation shape, `FormData` keys, upload fields, step values, response checks, navigation, and section transitions unchanged.
- Added `src/common/entry-workflow.js` for dashboard workflow metadata and read-only view endpoint resolution.
- Added `src/common/entry-workflow.test.js` covering dashboard order, labels, edit/view route paths, and endpoint/view type resolution.
- Reused the metadata in `src/pages/dashboard.jsx` and `src/component/feature-component/FilmSubmissionView.jsx`.
- Kept dashboard ordering, route names, paid-view branching, endpoint names, view type branches, payloads, and form step behavior unchanged.
- Added shared return/declaration/payment section step helpers and film payment metadata helpers to `src/common/film-workflow.js`.
- Extended `src/common/film-workflow.test.js` to cover those exact feature/non-feature values.
- Reused the helpers in `src/component/feature-component/return-component.jsx`, `src/component/feature-component/Declaration-component.jsx`, and `src/component/feature-component/PaymentSection-component.jsx`.
- Kept `FormData` keys, submitted step values, back/next target sections, payment form type, payment description, endpoint names, response checks, and final submit behavior unchanged.
- Added shared award payment metadata to `src/common/award-workflow.js`.
- Extended `src/common/award-workflow.test.js` to cover best book and film critic payment form types, descriptions, and preview previous-section values.
- Reused the metadata in `src/component/best-book-component/preview-payment.jsx` and `src/component/best-filmCritic-component/view-component.jsx`.
- Kept payment form types, descriptions, previous-section targets, final-submit endpoints, query invalidation keys, response checks, and `FormData` keys unchanged.
- Added shared award section step helpers to `src/common/award-workflow.js`.
- Extended `src/common/award-workflow.test.js` to cover first/detail/publisher/declaration submitted step values and previous/next section transitions.
- Reused the helpers in best book author, book details, publisher, and declaration sections.
- Reused the helpers in film critic first, critic, publisher, and declaration sections.
- Kept submitted step values, back/next target sections, endpoint names, response checks, validation conditions, and `FormData` keys unchanged.
- Added `filmFinalSubmitEndpoint` to `src/common/film-workflow.js`.
- Extended `src/common/film-workflow.test.js` to cover the final-submit endpoint and full film section navigation metadata.
- Reused `getFilmEntryByEndpoint` in feature and non-feature route pages.
- Reused film step/navigation helpers in the remaining film workflow sections.
- Kept submitted step values, route page resume behavior, previous/next target sections, final-submit behavior, endpoint names, response checks, validation conditions, and `FormData` keys unchanged.

### Phase 6

- Added `src/services/apiEndpoints.js` for auth, dashboard, common service endpoints, and public auth endpoint suffix detection.
- Added `src/services/apiEndpoints.test.js` covering endpoint string values and public-route matching behavior.
- Updated `src/services/authService.js`, `src/services/dashboardService.js`, and `src/services/entryService.js` to reuse endpoint metadata.
- Updated `src/services/apiClient.js` to use the shared public-route helper for the existing loader exclusion behavior.
- Reused `commonEndpoints.languages` in feature film, best book, and film critic language lookups.
- Added `paymentEndpoints` and reused it in `src/common/services/paymentService.js`.
- Added `awardChildEndpoints` and reused it in book/editor child-resource list, store, update, and delete calls.
- Kept Axios client creation, interceptor setup/ejection, loader dispatches, token lookup, 401 handling, toast handling, response unwrapping, compatibility shims, endpoint strings, and body-level `statusCode` handling unchanged.
- Kept language lookup effects and Razorpay order/verification payloads unchanged.
- Kept award child-resource form payloads, refresh timing, delete confirmations, and toast behavior unchanged.

## Test Logs

### Lint

Command:

```powershell
npm.cmd run lint
```

Result:

```text
eslint src --ext .js,.jsx,.ts,.tsx
```

Status: Passed.

### Unit Tests

Command:

```powershell
npm.cmd exec vitest run
```

Result:

```text
No test files found, exiting with code 1
```

Status: No unit tests currently exist.

### Phase 1 Unit Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  1 passed (1)
Tests  4 passed (4)
Duration  359ms
```

Status: Passed.

### Phase 2 Unit Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  1 passed (1)
Tests  4 passed (4)
Duration  447ms
```

Status: Passed.

### Phase 3 Unit Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  1 passed (1)
Tests  4 passed (4)
Duration  524ms
```

Status: Passed.

### Phase 4 Unit Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  1 passed (1)
Tests  4 passed (4)
Duration  370ms
```

Status: Passed.

### Phase 5 Unit Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  2 passed (2)
Tests  7 passed (7)
Duration  361ms
```

Status: Passed.

### Phase 5 Endpoint Helper Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  3 passed (3)
Tests  9 passed (9)
Duration  440ms
```

Status: Passed.

### Phase 5 Contributor Endpoint Helper Tests

Command:

```powershell
npm.cmd run test
```

Result after rerun outside sandbox:

```text
Test Files  3 passed (3)
Tests  9 passed (9)
Duration  385ms
```

Status: Passed.

### Phase 5 Remaining Film Endpoint Helper Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  3 passed (3)
Tests  9 passed (9)
Duration  545ms
```

Status: Passed.

### Phase 5 Award Endpoint Helper Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  4 passed (4)
Tests  11 passed (11)
Duration  598ms
```

Status: Passed.

### Phase 5 Entry Workflow Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  5 passed (5)
Tests  15 passed (15)
Duration  637ms
```

Status: Passed.

### Phase 5 Film Step Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  5 passed (5)
Tests  18 passed (18)
Duration  708ms
```

Status: Passed.

### Phase 5 Award Payment Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  5 passed (5)
Tests  20 passed (20)
Duration  699ms
```

Status: Passed.

### Phase 5 Award Step Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  5 passed (5)
Tests  24 passed (24)
Duration  703ms
```

Status: Passed.

### Phase 5 Final Film Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  5 passed (5)
Tests  28 passed (28)
Duration  606ms
```

Status: Passed.

### Phase 6 Endpoint Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  6 passed (6)
Tests  31 passed (31)
Duration  653ms
```

Status: Passed.

### Phase 6 Film Child Endpoint Metadata Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  6 passed (6)
Tests  31 passed (31)
Duration  846ms
```

Status: Passed.

### Phase 7 Consolidated Unit Tests

Command:

```powershell
npm.cmd run test
```

Result:

```text
Test Files  6 passed (6)
Tests  31 passed (31)
Duration  785ms
```

Status: Passed.

## Compile/Build Logs

### Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2908 modules transformed.
dist/index.html 0.47 kB
dist/assets/index-CtmmoyKe.js 2,016.27 kB | gzip: 587.65 kB
built in 11.87s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with bundle-size warning.

### Phase 1 Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2908 modules transformed.
built in 11.73s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 2 Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2908 modules transformed.
built in 12.42s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 3 Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2908 modules transformed.
built in 12.27s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 4 Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2908 modules transformed.
built in 13.35s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2909 modules transformed.
built in 12.28s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Endpoint Helper Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2910 modules transformed.
built in 12.32s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Contributor Endpoint Helper Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2910 modules transformed.
built in 12.03s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Remaining Film Endpoint Helper Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2910 modules transformed.
built in 12.57s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Award Endpoint Helper Production Build

Command:

```powershell
npm.cmd run build
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2911 modules transformed.
built in 12.26s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Entry Workflow Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2912 modules transformed.
built in 11.06s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Film Step Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2912 modules transformed.
built in 11.05s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Award Payment Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2912 modules transformed.
built in 11.89s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Award Step Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2912 modules transformed.
built in 11.85s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 5 Final Film Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2912 modules transformed.
built in 10.92s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 6 Endpoint Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2913 modules transformed.
built in 11.18s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 6 Film Child Endpoint Metadata Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2913 modules transformed.
built in 16.56s
```

Warnings:

```text
Some chunks are larger than 500 kB after minification.
```

Status: Passed with existing bundle-size warning.

### Phase 7 Consolidated Production Build

Command:

```powershell
npm.cmd run build
```

Initial result inside sandbox:

```text
failed to load config from ...\vite.config.js
Error: spawn EPERM
```

Result after rerun outside sandbox:

```text
vite v6.3.5 building for production...
2913 modules transformed.
built in 8.54s
```

Warnings:

```text
Generated an empty chunk: "vendor-emotion-weak-memoize".
Generated an empty chunk: "vendor-fingerprintjs-fingerprintjs".
Generated an empty chunk: "vendor-react-router-dom".
Generated an empty chunk: "vendor-set-cookie-parser".
Generated an empty chunk: "vendor-tslib".
```

Status: Passed with existing Vite chunk warnings.

## Unit Test Status

- Vitest dependency is installed.
- `test` script exists in `package.json`.
- `src/common/common-function.test.js` exists.
- Current unit test status: 6 files passed, 31 tests passed.
- Coverage is still minimal and should be expanded before risky refactors.

## Final Verification Checklist

- [x] `AGENTS.md` instructions reviewed and followed.
- [x] Full frontend file inventory reviewed.
- [x] Current React 19 usage identified.
- [x] Completed React 19-compatible tasks documented.
- [x] Pending React 19 migration/refactor tasks documented.
- [x] Phase-by-phase plan documented.
- [x] Current phase status documented.
- [x] Final consolidated Phase 7 status documented.
- [x] Error logs documented.
- [x] Fix logs documented.
- [x] Test logs documented.
- [x] Compile/build logs documented.
- [x] Unit test status documented.
- [x] Business logic preserved.
- [x] Phase 1 test harness added without business logic changes.
- [x] Phase 1 lint passed.
- [x] Phase 1 tests passed.
- [x] Phase 1 build passed.
- [x] Phase 2 legacy comment audit completed without business logic changes.
- [x] Phase 2 compatibility shims preserved.
- [x] Phase 2 lint passed.
- [x] Phase 2 tests passed.
- [x] Phase 2 build passed.
- [x] Phase 3 hook safety audit completed without business logic changes.
- [x] Phase 3 lint passed.
- [x] Phase 3 tests passed.
- [x] Phase 3 build passed.
- [x] Phase 4 auth flow safety pass completed without API contract changes.
- [x] Phase 4 lint passed.
- [x] Phase 4 tests passed.
- [x] Phase 4 build passed.
- [x] Phase 5 resume-step helper slice completed without form contract changes.
- [x] Phase 5 lint passed for current slice.
- [x] Phase 5 tests passed for current slice.
- [x] Phase 5 build passed for current slice.
- [x] Phase 5 entry workflow metadata slice completed without route or endpoint changes.
- [x] Phase 5 film step/payment metadata slice completed without payload or transition changes.
- [x] Phase 5 award payment metadata slice completed without payload or transition changes.
- [x] Phase 5 award step metadata slice completed without payload or transition changes.
- [x] Phase 5 final film metadata slice completed without payload or transition changes.
- [x] Phase 5 safe workflow-constant pass completed.
- [x] Phase 6 endpoint metadata slice completed without Axios behavior changes.
- [x] Phase 6 film child endpoint metadata slice completed without payload or refresh behavior changes.
- [x] Phase 6 active service/query endpoint audit completed.
- [x] Phase 7 consolidated UI/accessibility pass completed without business logic changes.
- [x] Phase 7 lint, unit tests, and production build passed.
- [x] No Phase 7 pending tasks remain.
- [x] Phase 9 folder structure stabilization completed without business logic changes.
- [x] Phase 9 import/path updates verified.
- [x] Phase 9 lint, unit tests, and production build passed.
