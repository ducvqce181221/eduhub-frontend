# 03 — Role & Permission Matrix (Frontend view)
**Pre-Coding Documentation**
*Project:* EduHub — `eduhub-frontend` | *Version:* trimmed from backend v1.3 | *Status:* Refined before coding

---

> **Repo scope note:** This is a trimmed copy of `eduhub-backend/docs/03_Role_and_Permission_Matrix.md`,
> kept for one purpose only: deciding what the UI shows, hides, or disables per role. The
> backend enforces every rule below regardless of what the frontend does — this doc is
> **not** the security boundary, it just prevents rendering controls the user can't
> actually use. It drops the backend-only sections (`§4 Resource Ownership Rules` — how
> ownership is resolved through Prisma relation chains, and `§6 Implementation Guard
> Pattern` — the NestJS Guard pipeline). Read the full version in `eduhub-backend` if you
> need those.

## 1. Authorization Model
EduHub uses two separate concepts: **role permission** (RBAC) and **resource ownership**.
- A **role** answers: *'Is this type of user allowed to perform this action?'*
- **Ownership** answers: *'Is the resource involved actually owned by this user?'*

A request is authorized only when **both** applicable checks pass — enforced server-side.
The frontend's job is just to reflect this in the UI: e.g. a Teacher only sees Edit/Delete
buttons on courses returned by `GET /me/courses` (which the backend already scopes to their
own courses), and never needs to compare IDs client-side to decide ownership.

## 2. Roles & Account Lifecycle

| Role | Provisioning | Description |
| :--- | :--- | :--- |
| **Student** | Self-registration via `POST /auth/register`. | Learner who enrolls in published courses, watches lessons, completes quizzes, and tracks personal progress. |
| **Teacher** | Provisioned by Admin (`POST /users` or `PATCH /users/:id/role`). No self-registration flow — the frontend must not offer a "sign up as teacher" option. | Content creator who creates and manages owned courses, chapters, lessons, videos, resources, and quizzes, and inspects enrolled student progress. |
| **Admin** | Initial seed / Operational administrator. | Platform administrator with full access to manage users, roles, categories, course lifecycle, and system notifications. |

## 3. Permission Legend & Matrix (what the UI should show per role)
*Legend:*
- **C** = Create, **R** = Read, **U** = Update, **D** = Delete/Archive, **P** = Publish/Status management.
- **Own** = Resource must belong to the current authenticated user — UI derives this from data already scoped by the backend, not by comparing IDs itself.
- **Enrolled** = Student must possess an active enrollment record for the course.
- **All** = Unrestricted permission for that role.
- **No** = Action is prohibited — hide or disable the control entirely for this role.

| Resource / Action | Student | Teacher | Admin | Notes / Endpoints |
| :--- | :---: | :---: | :---: | :--- |
| **Profile: R/U** | Own | Own | Own | `/auth/me` |
| **Users: R/U/status/role** | No | No | All | `/users`, `/users/:id/*` — Admin-only panel |
| **Categories: R** | All | All | All | Public & authenticated course browsing |
| **Categories: C/U** | No | No | All | `/categories` — Admin-only panel |
| **Categories: D (delete)** | No | No | All (if 0 courses) | Backend returns `409` if courses are assigned — surface that message, don't pre-block the button |
| **Course: R published** | All | All | All | Public discovery `/courses` |
| **Course: R owned (all status)** | No | Own | All | `/me/courses` (includes Draft, Published, Archived) — Teacher dashboard |
| **Course: C** | No | Own new | All | `/courses` — "New course" button hidden for Student |
| **Course: U** | No | Own | All | `/courses/:id` |
| **Course: Archive** | No | Own | All | `/courses/:id/archive` |
| **Course: Publish/Unpublish** | No | Own | All | `/courses/:id/publish`, `/courses/:id/unpublish` |
| **Chapter/Lesson: C/U/D/reorder** | No | Own | All | Course builder UI (drag-and-drop reorder) — Student never sees this UI |
| **Lesson: R content** | Enrolled | Own | All | `/lessons/:id` — non-enrolled Student sees a "enroll to access" state instead |
| **Video/Resources: manage** | No | Own | All | Course builder UI |
| **Resources: R / download** | Enrolled | Own | All | `/lessons/:id` |
| **Enrollment: C (enroll)** | Self | No | Operational view | `/courses/:courseId/enroll` — "Enroll" button is Student-only |
| **Enrollment: R** | Own | Own course | All | `/me/enrollments`, `/courses/:id/students` |
| **Lesson progress: R/U** | Enrolled Own | No | System/Admin | Learning player heartbeat sync |
| **Course progress: R** | Enrolled Own | Own course | All | Student progress bar / Teacher analytics tab |
| **Quiz: C/U/D** | No | Own | All | Quiz editor UI |
| **Quiz attempt: C (submit)** | Enrolled | No | No | `/quizzes/:quizId/attempts` — Teacher/Admin never see a "take quiz" button |
| **Quiz result: R** | Own | Own course | All | Student result screen (score/pass-fail only, no `isCorrect` before submit — see `09_UX_Notes_on_Business_Rules.md`) |
| **Notifications: R/U read** | Own | Own | Own | Notification bell/dropdown, same UI for all roles |
| **System notification: C** | No | No | All | Admin broadcast form |

## 4. Authorization Decision Examples (for reasoning about UI states)
- A Student never sees a "New Course" or "Edit" button — the role check fails before ownership is even relevant.
- A Teacher viewing their own dashboard (`GET /me/courses`) sees Edit/Publish/Archive controls on every card, because the backend already filtered the list to their own courses.
- A Teacher who somehow navigates to another teacher's course detail page (e.g. via a stale link) should see a read-only view — if the API call for an edit action 403s, show a generic "you don't have access" state rather than a raw error.
- An Admin sees Edit/Publish/Archive controls on **every** course, including ones they don't own.
- The "Enroll" button is hidden if the Student already has an active enrollment for that course (derive this from `GET /courses/:id` or `/me/enrollments`, not from local state alone).
