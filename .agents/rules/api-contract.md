---
trigger: model_decision
description: Use for page/component API integration, defining types, or handling API errors in EduHub frontend.
---

Before calling a new endpoint or defining types for a request/response:
1. Consult `docs/05_API_Design.md` (mirrored from `eduhub-backend`) to retrieve the exact path, payload, and expected status codes.
2. If an endpoint is missing from documentation or payload structures appear changed in practice — stop and prompt the user to re-sync from `eduhub-backend` (or via `/api/docs-json`) before proceeding; never guess payloads.
3. All responses pass through the standard envelope — use a centralized API client wrapper to unwrap `data`/`meta` and format errors (`06_Frontend_Architecture.md` §4), avoiding redundant parsing across individual components.
4. HTTP `422` occurs strictly on the publish checklist (`PATCH /courses/:id/publish`) — all other business rule violations return `400`. Do not write UI handling for `422` elsewhere.
5. For paginated lists, always read `meta.page/limit/total/totalPages` — never deduce the total page count from the length of the `data` array.