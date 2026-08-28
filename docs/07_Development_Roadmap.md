# 07 — Development Roadmap (Frontend)
**Pre-Coding Documentation**
*Project:* EduHub — `eduhub-frontend` | *Version:* 1.5 (split from combined v1.5 roadmap) | *Status:* Refined before coding

---

> **Repo scope note:** The original combined roadmap put almost the entire build
> (Phases 1–10) on the backend and folded the whole frontend into a single Phase 11. That
> made sense as one narrative for a solo dev building backend-first, but it's too coarse
> to actually work from once this is its own repo. This version keeps the same phase
> numbers as `eduhub-backend/docs/07_Development_Roadmap.md` for cross-reference, but
> expands Phase 11 into real sub-phases and fills in this repo's slice of 12–14.
> Phases 1–10 don't apply here at all — see the backend roadmap for those.

## 1. Roadmap Philosophy
Same three-part discipline as the backend: **Learn**, **Build**, **Test** per phase, with
tests written within the phase rather than deferred. UI behavior should conform to
`09_UX_Notes_on_Business_Rules.md` wherever a business rule has a visible effect.

## 2. Recommended Phase Progression (Frontend)

```
+-------------------------------------------------------------------------------+
|                (Phases 1–10 happen in eduhub-backend first)                   |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| 11a: App shell, auth, route guards                                            |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| 11b: Public catalog & course detail  -->  11c: Student learning experience     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| 11d: Teacher course builder & analytics  -->  11e: Admin panel                |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| 12 (frontend slice): OAuth login button / AI summary UI                       |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| 13 (frontend slice): Browser E2E suite & portfolio polish                     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                 14 (frontend slice): Frontend deployment                      |
+-------------------------------------------------------------------------------+
```

## 3. Phase Breakdown

### Phase 11a — App Shell, Auth & Route Guards
- **Learn:** Next.js App Router, Server vs Client Components, layout-based route
  protection, auth state management.
- **Build:** Base layout/navigation shell; login/register/forgot-reset-password pages
  (FR-A01–FR-A06); auth context/state + token refresh handling per
  `06_Frontend_Architecture.md` §2; route guard layouts for the three role tiers
  (`03_Role_and_Permission_Matrix.md`).
- **Test:** Protected-route redirect tests (unauthenticated → `/login`, wrong role → not-authorized page); token refresh-on-401 test.

### Phase 11b — Public Catalog & Course Detail
- **Learn:** Data fetching patterns for public/cached endpoints, pagination UI, responsive grid/list layouts.
- **Build:** Course catalog with search/filter/pagination (`08_UI_Requirements.md` §1); course detail page with curriculum outline and role-aware CTA (Enroll vs Continue learning vs Edit).
- **Test:** Filter/pagination interaction tests; CTA-state tests per auth/role/enrollment combination.

### Phase 11c — Student Learning Experience
- **Learn:** Video player event handling, heartbeat sync intervals, optimistic vs server-confirmed progress state.
- **Build:** My-enrollments dashboard, learning player with periodic `PUT /lessons/:id/progress` heartbeat, quiz take screen, quiz result screen, course progress view (`08_UI_Requirements.md` §3).
- **Test:** Heartbeat sync tests (including offline/retry behavior); quiz submit flow test; progress-bar-matches-backend-threshold test (BR-PRG-01).

### Phase 11d — Teacher Course Builder & Analytics
- **Learn:** Drag-and-drop reordering UI, nested form state (chapters → lessons → video/resources/quiz), optimistic UI for batch-reorder calls.
- **Build:** Teacher dashboard (`/me/courses`), course builder (metadata, chapter/lesson tree, drag-and-drop reorder wired to the batch reorder endpoints, video/resource forms, quiz editor), publish-checklist UI (`09_UX_Notes_on_Business_Rules.md` — BR-CRS-02), archive/unpublish confirm flows, enrolled-students & quiz-results views (`08_UI_Requirements.md` §4).
- **Test:** Reorder drag-drop interaction tests; publish-checklist render test against a mocked `422` payload; delete-blocked-on-published-floor UX test (BR-CRS-06).

### Phase 11e — Admin Panel
- **Learn:** Admin-specific table/filter UX patterns, role/status change confirmation flows.
- **Build:** User management (list/search/filter/create/role/status), category management (create/edit/disable/delete with 409-aware messaging), platform-wide course oversight, system notification broadcast form (`08_UI_Requirements.md` §5).
- **Test:** Role-change and status-toggle interaction tests; category-delete-with-existing-courses error-surfacing test.

### Phase 12 — Advanced Optional Extensions (frontend slice)
- **Learn:** OAuth2 redirect/callback flow from the client side, presenting AI-generated content in a UI.
- **Build:** Depending on which optional extension the backend implements: a "Sign in with Google" button + redirect handling, and/or an AI course-summary panel on the course detail/builder page.
- **Test:** OAuth redirect flow test (mocked); AI summary loading/error state test.

### Phase 13 — Browser E2E Testing & Portfolio Packaging (frontend slice)
- **Learn:** Browser-based E2E orchestration (Playwright/Cypress), portfolio documentation with screenshots/GIFs.
- **Build:** Full student journey E2E test running against a live `eduhub-backend` instance (register → browse → enroll → watch → quiz → completion, mirroring the backend's own API-level E2E suite from its Phase 13); frontend README with screenshots and setup instructions.
- **Test:** Run the full browser E2E suite in CI against a test backend deployment.

### Phase 14 — Deployment (frontend slice)
- **Learn:** Static/SSR deployment models for Next.js, environment variable management across environments.
- **Build:** Deploy to Vercel (managed path) or produce a static/self-hosted build served via Nginx alongside the backend on Oracle Cloud Free (DevOps path) — matching whichever deployment option was chosen on the backend side; configure `NEXT_PUBLIC_API_URL`/`API_URL` per environment; CI/CD pipeline for this repo's build/deploy.
- **Test:** Production smoke test against the deployed frontend hitting the deployed API; broken-env-var fallback check.
