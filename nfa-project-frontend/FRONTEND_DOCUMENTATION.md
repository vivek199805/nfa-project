# NFA Frontend Documentation

## Overview

`nfa-project-frontend` is the React + Vite frontend for National Film Awards submission workflows. It supports authentication, dashboard entry management, and multi-step submission flows for:

- Feature film entries
- Non-feature film entries
- Best Book on Cinema entries
- Best Film Critic on Cinema entries

This documentation was prepared after reviewing the repository-level `AGENTS.md` instructions and the frontend source tree. The frontend should be treated as the active client for the Mongo-backed Express API in `bancked/`; dormant Appwrite paths in the backend are not part of the current frontend contract.

## Technology Stack

- React 19 with Vite 6
- React Router v7 using `createBrowserRouter`
- Redux Toolkit and React Redux
- TanStack React Query v5
- Axios
- React Hook Form with Zod validation
- Bootstrap, React Bootstrap, Bootstrap Icons
- MUI packages and date pickers
- Sonner toasts
- Swiper carousel
- Razorpay checkout integration
- `html2canvas` and `jspdf` for PDF generation
- `lucide-react` icons in selected UI components

## Project Structure

```text
nfa-project-frontend/
  public/
    images/                 Static images used by auth, dashboard, and layout screens
    vite.svg
  src/
    app/                    App-wide providers and canonical Redux store
    assets/                 Vite starter asset folder
    common/                 Shared helpers, navigation bridge, modal, date picker, legacy service facade
    component/              Layouts and domain form sections
    features/               Redux feature slices and feature barrel files
    hooks/                  Auth context, shared hooks, and React Query wrappers
    lib/                    Query client and query key definitions
    pages/                  Route-level pages
    services/               Canonical API client and domain service wrappers
    store/                  Compatibility exports for older Redux imports
    styles/                 Global and feature CSS files
    App.jsx                 Route tree
    main.jsx                React entry point
    index.css               Global styles
```

## Application Boot Flow

The app starts in `src/main.jsx`, imports global CSS and third-party styles, then renders `<App />` inside `<AppProviders />`.

`src/app/providers.jsx` wires:

- `QueryClientProvider` with `src/lib/queryClient.js`
- Redux `Provider` with `src/app/store.js`
- Global Sonner `Toaster`
- Axios interceptors through `attachApiInterceptors(store)`

`src/App.jsx` defines the browser router and renders the global `Loader` plus `RouterProvider`.

## Routing

Routes are defined in `src/App.jsx`.

Main route groups:

- `/` auth layout with nested login page
- `/signup`
- `/forgot-password`
- `/change-password`
- `/reset-password`
- `/dashboard`
- `/feature` and `/feature/:id`
- `/feature/view/:id`
- `/non-feature` and `/non-feature/:id`
- `/best-book`, `/best-book/:id`, `/best-book/view/:id`
- `/film-critic`, `/film-critic/:id`, `/film-critic/view/:id`
- `*` fallback not-found route

Observation: `feature` and `non-feature` routes are declared both as direct children and nested route groups. This likely preserves behavior, but it is duplication to be careful around if router cleanup is attempted.

## Layout and Auth Context

`src/component/layouts/layout.jsx` wraps routed content with `AuthProvider` and `NavigateSetter`. It chooses auth vs app background classes based on the current path.

`src/hooks/use-auth.jsx` provides:

- Current user from Redux auth state
- Login mutation
- Register mutation
- Logout mutation

Auth data is persisted in `localStorage` under the `userData` key through `src/features/auth/authStorage.js`.

## State Management

The canonical Redux store is `src/app/store.js`.

Reducers:

- `auth`: user, token, authentication status
- `ui`: global loader, sidebar state, modal map
- `shared`: selected entry type and active workspace id
- `featureFilm`: feature form data cache
- `loader`: compatibility loader slice for older imports

`src/store/store.js`, `src/store/loaderSlice.js`, and related old store files exist for compatibility. New code should prefer `src/app/store.js` and `src/features/*`.

## API Layer

The canonical Axios client is `src/services/apiClient.js`.

Important behavior:

- `baseURL` comes from `import.meta.env.VITE_API_URL`
- Bearer token is read from Redux auth state or `localStorage.userData`
- Most requests trigger the global loader through Redux
- Selected auth routes are excluded from loader behavior
- `401` clears local storage, clears Redux auth state, navigates to `/`, and shows a session-expired toast
- `422` validation errors are unpacked and shown through toasts
- Other API errors are normalized into toast messages

The `http` helper returns response body data directly:

- `http.get`
- `http.post`
- `http.put`
- `http.patch`
- `http.delete`

Compatibility layer:

- `src/common/services/axiosService.js` re-exports the canonical `apiClient`
- `src/common/services/requestService.js` wraps `http` and normalizes thrown errors

Domain services:

- `src/services/authService.js`: login, register, password reset, OTP, change password
- `src/services/dashboardService.js`: dashboard entry list
- `src/services/entryService.js`: get entry by id, update entry, languages
- `src/common/services/paymentService.js`: Razorpay script loading, order creation, verification, checkout flow

## React Query

`src/lib/queryClient.js` defines global query defaults:

- 5 minute stale time for general queries
- 30 minute garbage collection time
- No retry for most 4xx errors except `429`
- Up to 2 retries otherwise
- Window-focus refetching disabled in production

Query keys are centralized in `queryKeys` for auth, dashboard, entry-by-id, and common language lookups.

Query hooks:

- `useDashboardEntriesQuery`
- `useEntryByIdQuery`
- `useUpdateEntryMutation`
- `useFetchById`, a compatibility wrapper around `useEntryByIdQuery`

## Forms and Validation Patterns

Most form sections use:

- Component-local Zod schema
- `useForm` from React Hook Form
- `zodResolver`
- `FormData` payload construction
- `postRequest` from `common/services/requestService`
- Body-level `response.statusCode` checks

This body-level `statusCode` contract is important. Many components treat `response.statusCode == 200` as success regardless of HTTP-level status handling.

Edit/resume behavior generally follows this pattern:

1. Read `:id` from `useParams`.
2. Fetch existing entry data with `useFetchById`.
3. Reset form default values after data arrives.
4. On submit, append `id` only for update flows.
5. Append `step` and domain-specific fields.
6. Advance `activeSection` on success.

## Multi-Step Entry Flows

### Feature Film

Page: `src/pages/feature-film.jsx`

Steps:

1. Film Details
2. Censor
3. Company Registration
4. Producer(s) Details
5. Director(s) Details
6. Actors
7. Songs
8. Audiographer
9. ScreenPlay
10. Return
11. Declaration
12. Payment

Key section components live in `src/component/feature-component/`.

### Non-Feature Film

Page: `src/pages/non-feature-film.jsx`

Steps:

1. General
2. Censor
3. Company Registration
4. Producer(s) Details
5. Director(s) Details
6. Other
7. Return
8. View
9. Declaration
10. Payment

This flow reuses several feature-film section components and adds non-feature-specific sections from `src/component/non-feature-component/`.

### Best Book on Cinema

Page: `src/pages/best-book.jsx`

Steps:

1. Author
2. Best Book on Cinema
3. Publisher / Editor
4. Declaration
5. Preview & Payment

Components live in `src/component/best-book-component/`.

### Best Film Critic

Page: `src/pages/best-filmCritic.jsx`

Steps:

1. Best Film Critic
2. Critic
3. Publisher / Journal
4. Declaration
5. View

Components live in `src/component/best-filmCritic-component/`.

## Dashboard

`src/pages/dashboard.jsx` is the main authenticated landing page.

It:

- Reads user data from `useAuth`
- Fetches entries with `useDashboardEntriesQuery`
- Redirects unauthenticated users to `/`
- Shows profile data and logout action
- Shows entry cards grouped by type
- Uses `payment_status != 2` to decide edit vs view behavior
- Opens `FeatureModalComponent` to create a new entry

Entry type routing:

- `feature` -> `/feature/:id`
- `non-feature` -> `/non-feature/:id`
- `bestBooks` -> `/best-book/:id`
- `bestFilmCritic` -> `/film-critic/:id`

## Authentication Screens

Auth pages live under `src/pages/auth/`.

- `login.jsx`: verifies email on blur, then logs in through `useAuth`
- `signUp.jsx`: validates registration fields and password strength
- `forgot-password.jsx`: sends OTP, verifies OTP, and navigates to reset password
- `reset-password.jsx`: resets password after OTP flow
- `change-password.jsx`: authenticated password change flow
- `auth.jsx`: auth route shell

The login/register flows use a mix of `useAuth` mutations and direct `authService` mutations.

## Shared UI Components

- `StepIndicator.jsx`: reusable step navigation; locks future steps and shows completed check icons
- `loader-component.jsx`: global overlay controlled by Redux loader state
- `passwordInput.jsx`: password input helpers used by auth forms
- `CustomOtp.jsx`: OTP entry component
- `NavigateSetter.jsx`: stores React Router navigation in a shared module for non-component redirects
- `layouts/navbar.jsx`: app header actions for dashboard/logout
- `common/modal/feature-modal.jsx`: entry type selector modal
- `common/CustomDatePicker.jsx`: shared date picker

## Styling and Assets

Styles are primarily plain CSS plus Bootstrap classes.

Important CSS files:

- `src/index.css`
- `src/App.css`
- `src/styles/dashboard.css`
- `src/styles/FeatureFilmForm.css`
- `src/styles/FilmSubmissionView.css`
- `src/styles/loader.css`
- `src/styles/change-password.css`
- `src/styles/accordion.css`
- `src/styles/ProducerTable.css`

Static images are served from `public/images/` and referenced with absolute paths such as `/images/nfa-logo.png`.

## Environment Variables

Required frontend variable:

```text
VITE_API_URL=<backend api base url>
```

The value is used for:

- Axios `baseURL`
- Public document links rendered in several form/view components

Do not hardcode production URLs in components. Keep environment-specific values in `.env` files.

## Setup and Run Instructions

From `nfa-project-frontend/`:

```bash
npm install
npm run dev
```

Build commands:

```bash
npm run build
npm run build:staging
npm run build:production
```

Preview production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
npm run lint:fix
```

The backend API must be running separately, and `VITE_API_URL` must point to its `/api` base.

## Important Contracts With Backend

- Auth endpoints are expected under `user/*` relative to `VITE_API_URL`.
- Film endpoints are expected under `film/*`.
- Shared endpoints such as `get-languages` and `entry-list` are called directly relative to the API base.
- Many success checks rely on body-level `statusCode`.
- Step resume depends on `active_step`.
- Dashboard edit/view routing depends on `payment_status`, where string/number `2` represents paid/completed.
- File links are often built as `${VITE_API_URL}/${storedFilePath}`.

Any field rename must be coordinated across:

- Backend Mongoose model
- Backend controller mapping
- Frontend Zod schema
- Frontend `FormData` payload construction
- Frontend edit-mode `reset` mapping
- View/preview rendering

## Testing Status

Vitest is installed, but no meaningful frontend test suite is currently present in the reviewed source tree.

Recommended first tests:

- API response normalization in `requestService`
- Auth storage and auth slice behavior
- Step resume calculations from `active_step`
- Pure formatting helpers in `common-function.js`
- Validation schemas for high-risk form sections

## Observations and Recommendations

- Replace the Vite starter `README.md` with project-specific onboarding content or link to this document.
- Avoid removing compatibility files until all imports are audited; several old import paths intentionally forward into newer modules.
- Remove debug `console.log` calls from form submit handlers and page effects during cleanup.
- Consolidate duplicate route declarations in `App.jsx` only after confirming route parity for create, edit, and view flows.
- Keep step definitions synchronized with backend workflow constants. The frontend currently keeps step arrays local to route pages.
- Prefer using the canonical `src/services/apiClient.js`, `src/app/store.js`, and `src/features/*` paths for new code.
- When touching upload fields, verify both create and edit behavior because many sections map persisted document paths back into file/link UI.
- Add targeted tests before changing validation, auth, payment, step progression, or request/response mapping.

