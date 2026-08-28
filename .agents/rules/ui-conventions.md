---
trigger: model_decision
description: Use for EduHub frontend pages, layouts, components, Next.js App Router conventions, and UI business rules.
---

- App Router: Prioritize Server Components for initial data fetching (catalog, course detail, dashboard list views); reserve Client Components strictly for interactive elements (video player heartbeat sync, drag-and-drop reordering, input forms, quiz taking screen).
- Organize routes by role groups: `(public)`, `(student)`, `(teacher)`, `(admin)` — aligning with the route guard tiers in `docs/06_Frontend_Architecture.md` §3.
- All paginated lists must share a single pagination component that reads `meta` from the response envelope (`docs/08_UI_Requirements.md` §6) — avoid per-screen custom pagination logic.
- Any action that can be rejected by the backend per rules in `docs/09_UX_Notes_on_Business_Rules.md` (publish checklist, deleting the last lesson/chapter of a published course, rate limits...) must provide corresponding UI states: a visual checklist for `422` publish errors, confirm dialogs for irreversible actions (Archive), and clear messaging for `429` rate limits.
- Every screen capable of returning 403/404 must use a shared "not authorized" / "not found" state component — avoid rendering raw API error dumps in the UI.
- Never implement quiz score calculations or course completion percentage formulas on the frontend — always render the values calculated and returned by the API.