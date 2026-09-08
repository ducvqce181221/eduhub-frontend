# 06 — Frontend Architecture
**Pre-Coding Documentation**  
*Project:* EduHub — `eduhub-frontend` | *Version:* 1.0 (new — no equivalent existed before the repo split) | *Status:* Refined before coding

---

This is the frontend counterpart to the backend's `06_System_Architecture.md`. It only
covers what this repo needs to know: how to talk to the API, how auth works client-side,
and how routes are protected. It intentionally has no opinion on Prisma, Redis, or
RabbitMQ — those are backend internals this repo never touches directly.

## 1. Client–Server Boundary
```
+---------------------------------------------------------------+
|                    Next.js (eduhub-frontend)                  |
|  Server Components (data fetch) + Client Components (player,  |
|  forms, drag-and-drop reorder)                                |
+------------------------------+----------------------------------+
                               | HTTP / REST, JWT Bearer, base URL
                               | from NEXT_PUBLIC_API_URL / API_URL
                               v
+---------------------------------------------------------------+
|              NestJS API (eduhub-backend) — /api/v1             |
+---------------------------------------------------------------+
```
This repo only ever talks to the API over REST as documented in `05_API_Design.md`. There
is no direct database, cache, or message-broker access from the frontend, ever — if a
screen seems to need one, it needs a new backend endpoint instead.

## 2. Auth Token Handling
- Access token + refresh token are issued by `POST /auth/login` (see `05_API_Design.md`).
- Store the access token in memory (React context/state), not `localStorage`, to reduce
  XSS exposure; use the refresh token (httpOnly cookie, if the backend sets one, or a
  secure storage fallback) to silently mint a new access token via `POST /auth/refresh`
  when a request comes back `401`.
- On `401` from any API call: attempt one silent refresh; if that also fails, clear local
  auth state and redirect to `/login`.
- Never decode the JWT to derive role/permissions for UI logic beyond what's needed for
  immediate rendering — always treat `GET /auth/me` as the source of truth for the current
  user's role and profile.

## 3. Route Protection Pattern
- Public routes: course discovery/catalog, course detail (published only), login,
  register, forgot/reset password.
- Authenticated routes: profile, notifications — any logged-in role.
- Role-gated routes: `/teacher/*` (Teacher + Admin), `/admin/*` (Admin only), `/learn/*`
  and enrollment actions (Student, and only for enrolled courses).
- Use a layout-level guard (Next.js middleware or a shared layout component) per route
  group rather than checking role inline in every page — keeps the check in one place per
  role tier, matching the tiers in `03_Role_and_Permission_Matrix.md`.
- A failed guard redirects to `/login` (unauthenticated) or a "not authorized" page
  (wrong role) — never a silent blank page.

## 4. Consuming the Response Envelope
Every API response follows the envelope in `05_API_Design.md` §1.1:
- Success: `{ success: true, data, meta? }` — read `meta` for pagination (`page`, `limit`,
  `total`, `totalPages`) on any list view.
- Error: `{ success: false, statusCode, message, error, timestamp, path }` — `message` can
  be a string or an array of validation messages (from `class-validator`); render both
  forms in form-error UI.
- Centralize this parsing in one API client wrapper (e.g. a thin fetch/axios wrapper) so
  every page/component gets already-unwrapped `data` and a consistent error shape, instead
  of re-checking `success` everywhere.

## 5. Client State, Forms, and Component Ecosystem

### 5.0 UI Component Architecture (`shadcn/ui` CLI)
- All UI components are scaffolded and managed via the official CLI: `pnpm dlx shadcn@latest add <component>` based on `components.json` (`radix-nova` style with unified `radix-ui` runtime).
- Do not manually install or import discrete `@radix-ui/react-*` primitive packages. All UI source files live in `components/ui/` and adhere to `docs/DESIGN.md`.

### 5.1 Server State & Caching (`@tanstack/react-query`)
- Used for all Client Component data fetching, cache invalidation, and mutations.
- **Optimistic Updates:** Applied during drag-and-drop chapter/lesson reordering, status toggles, or quiz submissions so the UI responds instantaneously before backend confirmation.
- **Cache Invalidation:** After mutations (creating/editing/deleting lessons, updating profile), invoke `queryClient.invalidateQueries()` to re-synchronize the freshest data from the backend.
- Centralized management of Loading states (Skeleton loaders per `docs/DESIGN.md`) and Error states.

### 5.2 URL State Management (`nuqs`)
- Manages search, filter, and pagination states on the URL query string (`searchParams`) via a type-safe hook (similar to `useState`).
- Applied to:
  - **Public Catalog (`/courses`):** Synchronizes `search`, `category`, `level`, `page`, `sort`.
  - **Admin / Teacher Tables:** Synchronizes `page`, `limit`, `role`, `status`, `sort`.
  - Ensures browser back/forward navigation functions accurately without triggering redundant full-page re-renders.

### 5.3 Form Handling & Validation (`react-hook-form` + `zod` + `@hookform/resolvers`)
- All input forms utilize Zod schemas for client-side validation prior to sending payloads to NestJS.
- Frontend Zod schemas directly mirror the validation rules of backend `class-validator` DTOs (e.g. email formats, password complexity regex, required fields).
- Seamlessly integrated with shadcn/ui `Form`, `FormControl`, `FormField`, and `FormMessage`.

### 5.4 Video Player & Progress Heartbeat (`@vidstack/react@next`)
- Utilizes `@vidstack/react@next` for the learning player view (`/learn/:courseSlug/:lessonId`).
- Delivers a dark-themed, responsive player interface across desktop and mobile.
- **Heartbeat Progress Tracking:**
  - Listens to `timeupdate` events and triggers a periodic heartbeat interval (every 15–30 seconds) sending `PUT /lessons/:id/progress` with `{ progressSeconds: Math.floor(currentTime) }`.
  - Listens to `ended` events to automatically trigger lesson completion.
  - Strictly conforms to business rule **BR-PRG-01** (completion threshold ≥ 90% of total lesson duration).

### 5.5 Course Builder Drag-and-Drop (`@dnd-kit/react`)
- Employs `@dnd-kit/react` (latest) for the Chapter & Lesson tree in the Teacher Dashboard.
- Handles multi-level reordering: rearranging Chapter order, reordering Lessons within a Chapter, or transferring Lessons across Chapters.
- Integrates the `GripVertical` icon (`dnd-drag-handle`) and horizontal drop line `dnd-drop-indicator` styled with Notion hairline dividers and blue drop indicator.

### 5.6 Headless Data Tables (`@tanstack/react-table`)
- Decouples table logic (pagination, column sorting, filtering, row selection) for administration views:
  - Admin: User Management, Category Management.
  - Teacher: Enrolled learners & progress tracking, Quiz aggregated analytics.
  - Bound to the Notion-inspired styling (warm `canvas-soft` header `#f6f5f4`, hairline borders `#e6e6e6`, eyebrow typography) defined in `docs/DESIGN.md`.

### 5.7 API Type Generation Contract (`openapi-typescript`)
- Hand-crafting DTO interfaces is avoided to eliminate drift against the backend.
- Uses `openapi-typescript` targeting the NestJS Swagger OpenAPI schema directly:
  ```bash
  pnpm run typegen:api
  # command execution: pnpm dlx openapi-typescript $NEXT_PUBLIC_API_URL/api/docs-json -o src/types/api.generated.ts
  ```
- All endpoint parameters, request bodies, and response envelopes are derived directly from this generated contract.

### 5.8 Client-side Media & Direct Upload Strategy (Cloudinary + Cloudflare R2)
- **Image Uploads (Avatars & Course Thumbnails):**
  - Uses `react-dropzone` / file input for image selection.
  - Sends multipart payload to `POST /upload/image` (NestJS proxy) or directly with Cloudinary signature for automatic WebP optimization and facial/center cropping.
- **Video & File Uploads (Lesson Videos & Downloadable Resources):**
  - High-volume uploads bypass the NestJS API server completely:
    1. Client calls `POST /upload/presigned-url` with `{ fileName, fileType, folder: 'videos' | 'resources' }`.
    2. Backend returns an S3 Presigned PUT URL targeting Cloudflare R2.
    3. Client uploads the raw binary file directly to Cloudflare R2 using `fetch(uploadUrl, { method: 'PUT', body: file })` or Axios with `onUploadProgress` to render dynamic upload progress bars (0–100%).
    4. Upon successful upload, client submits the resulting `fileUrl` to the respective domain endpoint (`PUT /lessons/:id/video` or `POST /lessons/:id/resources`).

### 5.9 Testing Suite (`vitest` + `@testing-library/react`)
- Executes the **Learn - Build - Test** discipline established in `07_Development_Roadmap.md`:
  - Unit tests for helpers, date formatting, and token lifecycle logic.
  - Component tests for Route Guards, Auth forms, Publish Checklist rendering (against mocked 422 payloads), and Quiz option selection.

## 6. What This Repo Does *Not* Need to Know
- Prisma schema, migrations, cascade rules — backend-only (`eduhub-backend/docs/04`).
- Redis caching/invalidation, RabbitMQ events/DLQ — backend-only (`eduhub-backend/docs/06`).
- Guard implementation chain (`JwtAuthGuard` → `RolesGuard` → Ownership Guard) — backend-only
  (`eduhub-backend/docs/03` §6). The frontend only needs the *outcome* of those checks
  (§3 above), not how they're implemented.

## 7. Internationalization (i18n) Architecture

EduHub delivers a fully localized bilingual experience across English (`en`) and Vietnamese (`vi`), architected natively on Next.js 16 (App Router) and React 19 without third-party runtime dependencies:

### 7.1 Sub-Path Routing & Middleware Resolution
- **URL Structure:** All application routes reside under `app/[locale]/` (`/en/...` and `/vi/...`).
- **Default Locale:** English (`en`).
- **Resolution Pipeline (`proxy.ts` — Next.js 16 convention):**
  1. Detects route requests lacking a locale prefix (e.g. `/courses`, `/login`).
  2. Resolves preferred locale using:
     - `eduhub_lang` cookie (user's explicit preference).
     - `Accept-Language` header (browser negotiation).
     - Fallback to `defaultLocale` (`en`).
  3. Issues a `307 Temporary Redirect` to `/${targetLocale}${pathname}${search}` while setting the `eduhub_lang` cookie.
  4. Static assets (`/_next`, `/images`, `/api`, favicon) bypass proxy rewriting.

### 7.2 SSR Dictionary Hydration & Zero-FOUC
- **Server Loader (`lib/i18n/server.ts`):** `getDictionary(locale)` dynamically imports modular JSON/TypeScript dictionaries (`en.ts`, `vi.ts`) on the server.
- **Root Layout Hydration (`app/[locale]/layout.tsx`):**
  - Sets the HTML `<html lang={locale}>` tag at initial render to eliminate SEO language warnings and client-side Flash of Unstyled Content (FOUC).
  - Injects alternate link metadata (`hreflang="en"`, `hreflang="vi"`, `hreflang="x-default"`).
  - Supplies the server-rendered dictionary directly to `<LanguageProvider initialLocale={locale} initialDictionary={dictionary}>`.

### 7.3 Client Context & Dynamic Language Switching (`lib/i18n/language-context.tsx`)
- **`useTranslation()` Hook:** Exposes `{ language, t, switchLanguage }` across all Client Components with strict TypeScript autocompletion and key parity (`satisfies Dictionary`).
- **Language Switching Mechanism:**
  - Updates the `eduhub_lang` cookie (`Max-Age=31536000`, `Path=/`, `SameSite=Lax`).
  - Swaps the active URL prefix dynamically (e.g. `/en/courses/web-dev` -> `/vi/courses/web-dev`) preserving URL query parameters and nested subpaths.
  - Updates in-memory dictionary state instantly without triggering unnecessary full-page unmounts.

### 7.4 Localized Navigation & Route Guards
- **`<LocalizedLink>` (`components/common/localized-link.tsx`):** Drop-in wrapper over `next/link` that automatically prepends `/${language}` to internal paths if absent, guaranteeing client navigation retains the active locale.
- **Route Guard Utilities (`lib/auth/redirect-utils.ts`):**
  - `stripLocale(pathname)`: Extracts normalized internal path for RBAC evaluation.
  - `ensureLocale(url, locale)`: Enforces correct locale prefixing for post-login return targets.

### 7.5 Multi-Locale Formatting (`lib/i18n/formatters.ts`)
- **Dates & Relative Timestamps:** Powered by `date-fns` using explicit locale bundles (`date-fns/locale/vi` and `enUS`).
- **Domain Enum Translators:** Centralized mapping for Course Levels (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`), Statuses (`DRAFT`, `PUBLISHED`, `ARCHIVED`), User Roles (`STUDENT`, `TEACHER`, `ADMIN`), and Notification Types.
- **Backend API Synchronization (`lib/api/client.ts`):** Automatically injects the active locale into the `Accept-Language` HTTP request header for consistent backend validation and error responses.

