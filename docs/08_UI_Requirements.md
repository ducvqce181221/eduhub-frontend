# 08 — UI Requirements (by screen)
**Pre-Coding Documentation**
*Project:* EduHub — `eduhub-frontend` | *Version:* 1.0 (new — derived from backend `02_Functional_Requirements.md`) | *Status:* Refined before coding

---

The backend's `02_Functional_Requirements.md` (kept in `eduhub-backend` only) lists
requirements by backend module (Auth, Users, Categories, ...). That's the right shape for
implementing endpoints, but the wrong shape for building screens — a single page here
often calls several of those modules. This doc re-groups the same requirements (cross-
referenced by FR-ID) by screen/page instead, for planning the actual UI build.

## 1. Public Pages (no auth required)
| Screen | Covers | Notes |
| :--- | :--- | :--- |
| **Home & Course Discovery (`/`)** | FR-CO07, FR-C01 | Unified landing and catalog portal: Hero banner, specialized tracks with course counts, full course catalog with category/level filter and pagination. Global search and Explore categories popover in Header. `/courses` redirected (308) to `/`. Calls `GET /courses` (Redis-cached) and `GET /categories`. |
| **Course detail (published)** | FR-CO02 | Shows curriculum outline; "Enroll" CTA swaps to "Continue learning" if the visitor is an enrolled Student. |
| **Login / Register** | FR-A01, FR-A02 | Register is Student-only — no role selector in the form (see BR-USR-01 in `09_UX_Notes_on_Business_Rules.md`). |
| **Forgot / Reset password** | FR-A05, FR-A06 | Two-step flow: request email → set new password via token link. |

## 2. Authenticated — Any Role
| Screen | Covers | Notes |
| :--- | :--- | :--- |
| **Profile** | FR-A08, FR-A09, FR-A10, FR-M01 | View/edit full name, upload/change avatar image (Cloudinary); no email change here per backend rules unless Admin does it via User Management. |
| **Change password** | FR-A07 | Requires current password. |
| **Notifications dropdown/page** | FR-N03, FR-N04, FR-N05 | Same component for all roles; unread badge count. |

## 3. Student Area
| Screen | Covers | Notes |
| :--- | :--- | :--- |
| **My enrollments** | FR-E02 | List of enrolled courses with progress bars. |
| **Learning player** | FR-E04, FR-E05, FR-E06 | Video player streaming Cloudflare R2 / external media with periodic heartbeat sync (`PUT /lessons/:id/progress`); shows quiz section if the lesson has one. |
| **Quiz take screen** | FR-Q04 | Single-choice questions, submit-all pattern (not per-question); no indication of correct answers before submit. |
| **Quiz result screen** | FR-Q06, FR-Q08 | Shows score/pass-fail and, per BR-QZ-06, only reveals `isCorrect` for *this* submitted attempt — historical attempts in the list view stay score-only. |
| **Course progress view** | FR-E06 | Percentage + completed/total lesson counts. |

## 4. Teacher Area
| Screen | Covers | Notes |
| :--- | :--- | :--- |
| **Teacher dashboard (`/me/courses`)** | FR-CO14 | All owned courses across Draft/Published/Archived, with status badges. |
| **Course builder** | FR-CO01, FR-CO03, FR-CO08–FR-CO13, FR-M01–FR-M03 | Create/edit metadata with Cloudinary thumbnail dropzone, chapter/lesson tree with drag-and-drop reorder, direct lesson video upload (Cloudflare R2 presigned PUT with progress bar) + duration, resource file uploader, quiz editor. |
| **Publish flow** | FR-CO05 | On `422`, render the backend's detailed checklist errors as a literal checklist UI (see `09_UX_Notes_on_Business_Rules.md`) rather than a generic error toast. |
| **Archive / Unpublish** | FR-CO04, FR-CO06 | Confirm dialogs; explain that Archive is terminal (can't come back from it — BR-CRS-04). |
| **Enrolled students & progress** | FR-E03 | Table of learners with per-learner completion %. |
| **Quiz results (per course)** | FR-Q07 | Aggregated pass rates per quiz/question. |

## 5. Admin Area
| Screen | Covers | Notes |
| :--- | :--- | :--- |
| **User management** | FR-U01–FR-U07 | List/search/filter, create operational user (e.g. provision a Teacher), change role/status. |
| **Category management** | FR-C02–FR-C05 | Create/edit/disable/delete; delete button should still be clickable even if it might 409 — surface the "has active courses" message from the API rather than trying to predict it client-side. |
| **Platform course oversight** | FR-CO02, FR-CO04 | Read/archive any course regardless of owner. |
| **System notification broadcast** | FR-N06 | Simple form: title + message → `POST /notifications/system`. |

## 6. Cross-cutting
- Every list screen above with pagination reads `meta.page/limit/total/totalPages` from
  the envelope (`06_Frontend_Architecture.md` §4) — build one reusable pagination
  component rather than per-screen logic.
- Every screen that can 403 (wrong role, not-owner) or 404 (deleted resource) should have a
  shared "not authorized" / "not found" state, not a raw error dump.
