# 09 — UX Notes on Business Rules
**Pre-Coding Documentation**
*Project:* EduHub — `eduhub-frontend` | *Version:* 1.0 (new — extracted from backend `08_Business_Rules.md`) | *Status:* Refined before coding

---

The backend's `08_Business_Rules.md` (kept in full only in `eduhub-backend`) is the single
source of truth for validation and enforcement — the frontend never re-implements any of
it. This doc is just a short pointer list of the handful of rules that change what a
screen should *show*, so a UI decision doesn't get made from scratch (or wrong) while
building. Rule IDs match the backend doc exactly for cross-reference.

| Rule ID | UX implication |
| :--- | :--- |
| **BR-USR-01** | Registration form has no role selector — public sign-up is always Student. |
| **BR-CRS-02** (Publish-Ready Checklist) | On `422` from `PATCH /courses/:id/publish`, render the returned list of missing items as an actual checklist (✅/❌ per criterion), not a generic error message — the backend already returns the detail needed for this. |
| **BR-CRS-04** (Archive is terminal) | Archive action needs a confirm dialog that says this can't be undone — there is no "unarchive" endpoint. |
| **BR-CRS-06** (Published curriculum floor) | Disable/gray out "Delete" on a chapter/lesson when it's the last one in a published course, with a tooltip pointing to "Unpublish first" — this is a UX nicety only; the backend still rejects it with `400` either way, so don't skip the confirm-then-catch-error fallback. |
| **BR-QZ-04** (Unlimited attempts) | Quiz result screen should offer a clear "Retry quiz" action, not just a one-shot submit. |
| **BR-QZ-06** (Answer masking) | Never expect `isCorrect` on `Answer` objects except in the response to the student's *own just-submitted* attempt. Don't build a "review past attempt in detail" screen that assumes it's available — it isn't. |
| **BR-PRG-01** (90% watch threshold) | Progress bar / "mark as watched" state should reflect the same ≥90% threshold the backend enforces, so the UI doesn't show 100%-looking progress before the backend agrees it's complete. |
| **BR-ENR-03** (No self-unenrollment) | Don't build an "unenroll" button for students — it has no corresponding endpoint. |
| **BR-SEC-01** (Rate limiting) | Login/register/forgot-password forms should handle `429` gracefully (e.g. "too many attempts, try again in a minute") instead of showing it as a generic failure. |

Everything else in `08_Business_Rules.md` (slug generation, cascade deletes, cache TTLs,
RabbitMQ event names, transaction boundaries, etc.) is invisible to the frontend by design
— it doesn't change what any screen shows, so it isn't repeated here.
