<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

EduHub — LMS portfolio/learning project platform. This repo is the Next.js client: students register, enroll in courses, view lessons (video + quiz), and track progress; teachers create/manage courses; administrators manage the platform. All business logic and data persistence reside in `eduhub-backend` (NestJS) — this repo communicates exclusively via REST API. Full context and scope are available in `docs/01_Project_Overview.md`.

## Tech Stack

- **Core & Framework:** Next.js (App Router) + TypeScript + React
- **Package Manager:** pnpm
- **Styling & Design System:** Tailwind CSS, shadcn/ui CLI (`components.json` / `radix-nova` style), Lucide React, Inter font + Notion-inspired design system (see `docs/DESIGN.md`)
- **Data Fetching & Server Cache:** `@tanstack/react-query` (mutations, cache invalidation, optimistic updates)
- **URL State Management:** `nuqs` (type-safe searchParams synchronization for catalog discovery & table filters)
- **Forms & Validation:** `react-hook-form` + `zod` + `@hookform/resolvers` (mirrored from NestJS DTO schemas)
- **Data Tables:** `@tanstack/react-table` (User management, Categories, learner progress)
- **Drag and Drop:** `@dnd-kit/react` (reorder chapter/lesson in Course Builder)
- **Video Player:** `@vidstack/react@next` (lesson playback, video progress tracking, heartbeat sync)
- **Toast Notifications:** `sonner` (async promise toasts via `toast.promise`)
- **Date & Time:** `date-fns` (timestamps, relative time formatting)
- **CSS Utilities:** `clsx`, `tailwind-merge`
- **Type Generation:** `openapi-typescript` (automated type generation from NestJS Swagger `/api/docs-json`)
- **Testing:** `vitest` + `@testing-library/react` (Unit / Component testing)
- **Backend Communication:** REST + JWT Bearer, base URL configured via `NEXT_PUBLIC_API_URL` / `API_URL`
- No direct DB/ORM/cache/queue in this repository — all handled by `eduhub-backend`

## Source Documentation (Read relevant sections before coding)

- `docs/01_Project_Overview.md` — context, scope, user flows (full version, shared with backend)
- `docs/03_Role_and_Permission_Matrix.md` — **UI-focused summary**: which controls each role can/cannot see. Full backend enforcement matrix is in `eduhub-backend`.
- `docs/05_API_Design.md` — **mirrored from `eduhub-backend`**, do not manually modify endpoints here when backend changes — copy over or generate types via `/api/docs-json`.
- `docs/06_Frontend_Architecture.md` — API client design, JWT access/refresh handling, role route guards, client state, and library ecosystem.
- `docs/07_Development_Roadmap.md` — frontend-specific roadmap (Phase 11a–11e, and FE slice of Phase 12–14). Phases 1–10 belong to `eduhub-backend`.
- `docs/08_UI_Requirements.md` — requirements organized **by screen**, cross-referencing original backend FR-IDs.
- `docs/09_UX_Notes_on_Business_Rules.md` — backend business rules affecting UI behavior (publish checklist, unlimited quiz attempts, hidden `isCorrect`, 90% threshold...). This is **not** where validation is re-implemented — the backend is always the final authority.
- `docs/DESIGN.md` — Complete Design System (Notion-inspired warm paper canvas, Notion blue actions, Inter type, pill buttons, hairline borders, sticker accents).

## Mandatory Rules

1. Do not re-implement business logic/validation on the frontend — only call APIs and render according to the standard response envelope (`{ success, data, meta }` / `{ success: false, statusCode, message, error, timestamp, path }`), see `06_Frontend_Architecture.md` §4.
2. Route guards by role must always reside at layout level, never checked ad-hoc within individual pages — see `06_Frontend_Architecture.md` §3 and the table in `03_Role_and_Permission_Matrix.md`.
3. Keep the access token in memory/state, never in `localStorage`; refresh token flow follows `06_Frontend_Architecture.md` §2. Never manually decode the JWT to deduce roles — always fetch from `GET /auth/me`.
4. When an action may be rejected by the backend per rules in `09_UX_Notes_on_Business_Rules.md` (e.g. deleting the last chapter of a published course), the UI may disable/warn in advance for better UX, but must still handle real error responses from the backend — never assume the UI has caught everything.
5. When the API changes (new endpoints/modified payloads), update `docs/05_API_Design.md` from `eduhub-backend` before modifying API call code, or run `pnpm run typegen:api`.
6. Always manage and add UI components via `pnpm dlx shadcn@latest add <component>` (or `npx shadcn@latest add <component>`) per `components.json` — never install individual `@radix-ui/react-*` primitive packages manually.

## Common Commands

```bash
pnpm install
pnpm run dev                          # run Next.js dev server
pnpm dlx shadcn@latest add <component> # add UI components (e.g. form, dialog, dropdown-menu, etc.)
pnpm run typegen:api                  # generate TypeScript types from backend Swagger (/api/docs-json)
pnpm test                             # unit/component tests with Vitest
pnpm run test:e2e                     # Playwright/Cypress E2E (requires eduhub-backend running)
pnpm run build
```

## Expected Directory Structure (Next.js App Router)

```
app/
  (public)/            # catalog, course detail, auth pages
  (student)/           # enrollments, learning player, quiz
  (teacher)/           # dashboard, course builder, analytics
  (admin)/             # user/category management, broadcasts
components/            # shared UI components (components/ui via shadcn)
lib/
  api/                 # API client wrapper (envelope parsing, auth header)
  auth/                # token state, refresh logic, route guard helpers
types/                 # types generated/derived from docs/05_API_Design.md
```

Do not write quiz grading logic, lesson completion threshold calculations, or publish-checklist validations on the frontend — these are always returned from the API, and the frontend only displays them.