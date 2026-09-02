---
trigger: model_decision
description: Use for EduHub frontend pages, layouts, components, Next.js App Router conventions, and UI business rules.
---

- App Router: Prioritize Server Components for initial data fetching (catalog, course detail, dashboard list views); reserve Client Components strictly for interactive elements (video player heartbeat sync, drag-and-drop reordering, input forms, quiz taking screen).
- Organize routes by role groups: `(public)`, `(student)`, `(teacher)`, `(admin)` — aligning with the route guard tiers in `docs/06_Frontend_Architecture.md` §3.
- All paginated lists must share a single pagination component that reads `meta` from the response envelope (`docs/08_UI_Requirements.md` §6) — avoid per-screen custom pagination logic.
- Any action that can be rejected by the backend per rules in `docs/09_UX_Notes_on_Business_Rules.md` (publish checklist, deleting the last lesson/chapter of a published course, rate limits...) must provide corresponding UI states: a visual checklist for `422` publish errors, confirm dialogs for irreversible actions (Archive), and clear messaging for `429` rate limits.
- Every screen capable of returning 403/404 must use a shared "not authorized" / "not found" state component — avoid rendering raw API error dumps in the UI.
- UI Components: Always add and manage UI components via `pnpm dlx shadcn@latest add <component>` (as configured in `components.json`) — never install individual `@radix-ui/react-*` primitive packages manually.
- **Design System Token First:** Never use arbitrary Tailwind values (`[...]`) for colors, backgrounds, borders, spacing, or radius when corresponding tokens exist in the `@theme` block of `app/globals.css` or `docs/DESIGN.md`. Always prioritize semantic tokens (`text-ink`, `text-ink-secondary`, `text-ink-muted`, `text-ink-faint`, `bg-canvas-soft`, `bg-surface`, `bg-notion-blue`, `hover:bg-notion-blue-active`, `border-hairline`, `bg-sticker-*`, etc.) over arbitrary hex/pixel definitions.
- Never implement quiz score calculations or course completion percentage formulas on the frontend — always render the values calculated and returned by the API.