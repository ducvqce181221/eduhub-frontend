---
trigger: model_decision
description: Use for frontend authentication (login/logout), token refresh, role-based guards, or conditional UI rendering.
---

Source Documentation: `docs/06_Frontend_Architecture.md` §2–§3, `docs/03_Role_and_Permission_Matrix.md`.

- Access token: Keep in memory/React state, never in `localStorage`/`sessionStorage`.
- When an API call returns `401`: attempt a single silent refresh via `POST /auth/refresh`; if the refresh fails as well, clear auth state and redirect to `/login`. Do not enter infinite refresh loops.
- Never decode the JWT to extract roles/permissions for UI logic — always treat `GET /auth/me` as the single source of truth for the current authenticated user.
- Route guards must be established at layout level across 3 tiers: Public / Authenticated (any role) / Role-gated (`/teacher/*`, `/admin/*`, `/learn/*` — see matrix in `03_Role_and_Permission_Matrix.md` §3). Never check roles ad-hoc inside nested child pages.
- Wrong role → display a clear "not authorized" screen; unauthenticated → redirect to `/login`. Avoid blank pages or silent console errors.
- Hide or disable controls by role based on the matrix in `03_Role_and_Permission_Matrix.md`, but always handle real `403` responses from the backend — never assume the UI has completely blocked unauthorized actions (e.g. stale tabs or direct links).