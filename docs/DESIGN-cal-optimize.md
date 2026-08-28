---
version: 1.0.0-production
name: EduHub-Cal-Design-System
description: Complete Design System for EduHub (Marketing, Public Catalog & Full App/Dashboard Chrome). Anchored on clean white canvas (#ffffff), near-black primary CTAs (#111111), custom Cal Sans display typography, Inter UI/Body, hairline dividers (#e5e7eb), and shadcn/ui component mappings.

colors:
  primary: "#111111"
  primary-active: "#242424"
  primary-disabled: "#e5e7eb"
  ink: "#111111"
  body: "#374151"
  muted: "#6b7280"
  muted-soft: "#898989"
  hairline: "#e5e7eb"
  hairline-soft: "#f3f4f6"
  canvas: "#ffffff"
  surface-soft: "#f8f9fa"
  surface-card: "#f5f5f5"
  surface-strong: "#e5e7eb"
  surface-dark: "#101010"
  surface-dark-elevated: "#1a1a1a"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-soft: "#a1a1aa"
  brand-accent: "#3b82f6"
  success: "#10b981"
  success-soft: "#ecfdf5"
  success-border: "#a7f3d0"
  warning: "#f59e0b"
  warning-soft: "#fffbeb"
  warning-border: "#fde68a"
  error: "#ef4444"
  error-soft: "#fef2f2"
  error-border: "#fecaca"
  badge-orange: "#fb923c"
  badge-pink: "#ec4899"
  badge-violet: "#8b5cf6"
  badge-emerald: "#34d399"

typography:
  display-xl:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -2px
  display-lg:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1.5px
  display-md:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1px
  display-sm:
    fontFamily: "Cal Sans, Inter, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.5px
  title-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.3px
  title-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  title-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  table-header:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.04em
    textTransform: uppercase
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px

components:
  # ==========================================
  # 1. CORE BUTTONS & ACTIONS
  # ==========================================
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
    height: 40px
  button-destructive:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: 40px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  button-icon-circular:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.full}"
    size: 36px

  # ==========================================
  # 2. APP SHELL, TOPBAR, AVATAR & NOTIFICATIONS
  # ==========================================
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.hairline}"
    typography: "{typography.nav-link}"
    height: 64px
  app-sidebar:
    backgroundColor: "{colors.canvas}"
    borderRight: "1px solid {colors.hairline}"
    width: 250px
    padding: 16px 12px
  sidebar-nav-item:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 36px
  sidebar-nav-item-active:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    fontWeight: 600
    rounded: "{rounded.md}"
  app-topbar:
    backgroundColor: "{colors.canvas}"
    borderBottom: "1px solid {colors.hairline}"
    height: 56px
    padding: 0 24px
  breadcrumb:
    textColor: "{colors.muted}"
    activeTextColor: "{colors.ink}"
    typography: "{typography.caption}"
  avatar:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    size: 36px
    border: "1px solid {colors.hairline}"
  avatar-sm:
    size: 32px
    rounded: "{rounded.full}"
  notification-bell-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    size: 36px
    rounded: "{rounded.md}"
    position: "relative"
  notification-badge-dot:
    backgroundColor: "{colors.error}"
    size: 8px
    rounded: "{rounded.full}"
    position: "absolute"
    top: "6px"
    right: "6px"
  notification-badge-counter:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    fontSize: 10px
    height: 16px
    minWidth: 16px
    padding: "0 4px"
    rounded: "{rounded.pill}"
    position: "absolute"
    top: "2px"
    right: "2px"
  notification-dropdown-item:
    backgroundColor: "{colors.canvas}"
    borderBottom: "1px solid {colors.hairline-soft}"
    padding: "12px 16px"
  notification-dropdown-item-unread:
    backgroundColor: "{colors.surface-soft}"
    borderBottom: "1px solid {colors.hairline-soft}"
    padding: "12px 16px"

  # ==========================================
  # 3. TABS SYSTEM
  # ==========================================
  tabs-list-line:
    backgroundColor: "transparent"
    borderBottom: "1px solid {colors.hairline}"
    gap: 24px
  tab-trigger-line:
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
    padding: "12px 0"
    borderBottom: "2px solid transparent"
  tab-trigger-line-active:
    textColor: "{colors.ink}"
    fontWeight: 600
    borderBottom: "2px solid {colors.primary}"
  tabs-list-pill:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.pill}"
    padding: 4px
  tab-trigger-pill:
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  tab-trigger-pill-active:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    fontWeight: 600
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"

  # ==========================================
  # 4. COURSE & ENROLLMENT CARDS
  # ==========================================
  course-card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    overflow: "hidden"
    transition: "transform 0.15s ease, box-shadow 0.15s ease"
  course-card-hover:
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
  course-card-thumbnail:
    aspectRatio: "16 / 9"
    backgroundColor: "{colors.surface-card}"
    objectFit: "cover"
    width: "100%"
  course-card-body:
    padding: 16px
  course-card-title:
    typography: "{typography.title-sm}"
    textColor: "{colors.ink}"
    lineClamp: 2
  course-card-instructor:
    typography: "{typography.caption}"
    textColor: "{colors.muted}"
  course-card-price:
    typography: "{typography.title-sm}"
    fontWeight: 600
    textColor: "{colors.ink}"
  enrollment-card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    overflow: "hidden"
  enrollment-card-progress-section:
    padding: "12px 16px"
    borderTop: "1px solid {colors.hairline-soft}"
    backgroundColor: "{colors.surface-soft}"

  # ==========================================
  # 5. DATA TABLES (TanStack Table + shadcn)
  # ==========================================
  data-table-container:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    overflow: "hidden"
  data-table-header:
    backgroundColor: "{colors.surface-soft}"
    borderBottom: "1px solid {colors.hairline}"
    textColor: "{colors.muted}"
    typography: "{typography.table-header}"
    height: 40px
    padding: 0 16px
  data-table-row:
    backgroundColor: "{colors.canvas}"
    borderBottom: "1px solid {colors.hairline-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    height: 48px
    padding: 0 16px
  data-table-row-hover:
    backgroundColor: "{colors.surface-soft}"
  data-table-pagination:
    backgroundColor: "{colors.canvas}"
    borderTop: "1px solid {colors.hairline}"
    padding: 12px 16px
    height: 56px

  # ==========================================
  # 6. EXTENDED FORM CONTROLS & QUIZ INPUTS
  # ==========================================
  form-label:
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    fontWeight: 600
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 40px
  text-input-focused:
    border: "1px solid {colors.ink}"
    boxShadow: "0 0 0 1px {colors.ink}"
  text-input-error:
    border: "1px solid {colors.error}"
  textarea:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    minHeight: 80px
  select-trigger:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 40px
  select-content:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  checkbox:
    size: 18px
    rounded: "{rounded.xs}"
    border: "1px solid {colors.hairline}"
    backgroundColor: "{colors.canvas}"
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    border: "1px solid {colors.primary}"
  radio-item:
    size: 18px
    rounded: "{rounded.full}"
    border: "1px solid {colors.hairline}"
    backgroundColor: "{colors.canvas}"
  radio-item-checked:
    border: "5px solid {colors.primary}"
    backgroundColor: "{colors.canvas}"
  quiz-option-card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    cursor: "pointer"
  quiz-option-card-selected:
    backgroundColor: "{colors.surface-soft}"
    border: "1.5px solid {colors.ink}"
  switch-track:
    width: 36px
    height: 20px
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.pill}"
  switch-track-checked:
    backgroundColor: "{colors.primary}"
  form-error-message:
    textColor: "{colors.error}"
    typography: "{typography.caption}"
    marginTop: 4px

  # ==========================================
  # 7. STATUS BADGES & TAGS
  # ==========================================
  badge-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
    border: "1px solid {colors.hairline}"
  badge-status-draft:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.body}"
    border: "1px solid {colors.hairline}"
  badge-status-published:
    backgroundColor: "{colors.success-soft}"
    textColor: "#065f46"
    border: "1px solid {colors.success-border}"
  badge-status-archived:
    backgroundColor: "{colors.error-soft}"
    textColor: "#991b1b"
    border: "1px solid {colors.error-border}"
  badge-status-pending:
    backgroundColor: "{colors.warning-soft}"
    textColor: "#92400e"
    border: "1px solid {colors.warning-border}"

  # ==========================================
  # 8. COURSE BUILDER, TREE & DND
  # ==========================================
  builder-chapter-card:
    backgroundColor: "{colors.surface-card}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: 16px
    marginBottom: 12px
  builder-lesson-row:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 10px 14px
    marginBottom: 8px
  dnd-drag-handle:
    textColor: "{colors.muted-soft}"
    cursor: "grab"
    size: 16px
  dnd-drop-indicator:
    height: 2px
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.full}"

  # ==========================================
  # 9. SPECIALIZED APP COMPONENTS
  # ==========================================
  publish-checklist-card:
    backgroundColor: "{colors.surface-card}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: 20px
  progress-bar-track:
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.full}"
    height: 6px
  progress-bar-indicator:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
  progress-bar-indicator-complete:
    backgroundColor: "{colors.success}"
    rounded: "{rounded.full}"
  empty-state-card:
    backgroundColor: "{colors.canvas}"
    border: "1px dashed {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: 48px 24px
    textAlign: "center"

  # ==========================================
  # 10. DIALOGS, SHEETS & TOASTS
  # ==========================================
  dialog-modal:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.xl}"
    padding: 24px
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
  sheet-drawer:
    backgroundColor: "{colors.canvas}"
    borderLeft: "1px solid {colors.hairline}"
    padding: 24px
  toast-sonner:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"

  # ==========================================
  # 11. MARKETING & FOOTER
  # ==========================================
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.body-sm}"
    padding: 64px

  # ==========================================
  # 12. VIDEO LEARNING PLAYER (@vidstack/react@next)
  # ==========================================
  video-player-container:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.lg}"
    overflow: "hidden"
    aspectRatio: "16 / 9"
    border: "1px solid {colors.hairline}"
  video-player-controls:
    backgroundColor: "rgba(16, 16, 16, 0.85)"
    backdropFilter: "blur(8px)"
    textColor: "{colors.on-dark}"
    height: 48px
    padding: "0 16px"
  video-player-progress:
    height: 4px
    backgroundColor: "rgba(255, 255, 255, 0.2)"
    trackColor: "{colors.brand-accent}"
---

## 1. Overview & Architectural Split

The system operates across two surfaces with the same underlying DNA:

1. **Marketing & Public Catalog (`/`, `/courses`):** Wide layouts (max 1200px), rich product mockup cards (`{components.feature-card}`), catalog grids (`{components.course-card}`), top navigation (`{components.top-nav}`), and dark footer (`{components.footer}`).
2. **App Chrome & Dashboards (`/teacher/*`, `/admin/*`, `/learn/*`):** Full-height application viewport (`h-screen overflow-hidden`), collapsible sidebars, dense data tables, modal drawers, quiz interfaces, and actionable form builders.

---

## 2. App Shell, Topbar & Navigation Spec

### Dashboard Shell (`/teacher/*`, `/admin/*`)

- **Sidebar (`{components.app-sidebar}`):**
  - **Desktop ($\ge 1024px$ / `lg`):** Left-pinned, 250px fixed width, white canvas, 1px right border (`{colors.hairline}`). Navigation items use `{components.sidebar-nav-item}`. Active item flips to `{components.sidebar-nav-item-active}` with 600 font weight.
  - **Mobile / Tablet ($< 1024px$):** Sidebar hidden. Triggered via hamburger button into a left-side `Sheet` drawer.
- **Header / Topbar (`{components.app-topbar}`):** 56px height, carries dynamic breadcrumbs at left and a right cluster with:
  1. Notification Bell Button (`{components.notification-bell-button}`): Triggers dropdown menu (FR-N03-05). Displays red badge dot (`{components.notification-badge-dot}`) if unread notifications exist.
  2. User Avatar (`{components.avatar}`): 36px circular avatar with fallback initials in `{typography.caption}`, opening user profile & logout dropdown menu.
- **Content Floor:** Uses `{colors.surface-soft}` (#f8f9fa) background with inner padding `p-6` (24px) or `p-8` (32px).

---

## 3. Responsive Breakpoints & Adaptive Layouts

| Breakpoint              | Width             | Catalog Grid | Dashboard Sidebar | Student Learn Screen (`/learn`)           | Data Table              |
| ----------------------- | ----------------- | ------------ | ----------------- | ----------------------------------------- | ----------------------- |
| **Mobile (`< 640px`)**  | `< 640px`         | 1 col        | Sheet Drawer      | Stacked: Video Top sticky, Tab list below | Horizontally scrollable |
| **Tablet (`md`)**       | `768px - 1023px`  | 2 cols       | Sheet Drawer      | Stacked (Video top 60vh, tabs below)      | Horizontally scrollable |
| **Desktop (`lg`)**      | `1024px - 1279px` | 3 cols       | Fixed 250px       | Split: 70% Player / 30% Sidebar           | Full desktop view       |
| **Wide Desktop (`xl`)** | $\ge 1280px$      | 4 cols       | Fixed 250px       | Split: 75% Player / 25% Sidebar           | Full desktop view       |

---

## 4. Course & Enrollment Card Specs

### 1. Catalog Course Card (`{components.course-card}`)

- **Thumbnail:** Aspect ratio 16:9 (`{components.course-card-thumbnail}`), top rounded 12px.
- **Card Body (`{components.course-card-body}`):**
  - Top Row: Category tag (`{components.badge-pill}`) + Level badge (Beginner/Intermediate/Advanced).
  - Middle: Course Title (2 lines clamp, `{typography.title-sm}`), Instructor name in `{typography.caption}`.
  - Bottom Row: Rating stars (orange), enrolled student count, Price in `{typography.title-sm}` bold.

### 2. Student Enrollment Card (`{components.enrollment-card}`)

- Used in "My Enrollments" (`/me/enrollments` - UI Requirements §3).
- Replaces price with a bottom progress band (`{components.enrollment-card-progress-section}`):
  - Course progress bar (`{components.progress-bar-track}` & `{components.progress-bar-indicator}`).
  - Label: _"45% completed (9/20 lessons)"_ in `{typography.caption}`.
  - Action: "Continue Learning" `{components.button-primary}`.

### 3. Teacher Dashboard Course Card (`/me/courses`)

- Replaces price with Status Badge (`{components.badge-status-*}`) + Action Dropdown Menu (Edit Curriculum, Analytics, Archive).

---

## 5. Form Controls & Quiz Interface (FR-Q04)

### Standard Inputs

- **Select / Dropdown (`{components.select-trigger}` + `{components.select-content}`):** 40px height, hairline border. Used for Category Filters and Data Table page size selector.
- **Textarea (`{components.textarea}`):** Minimum height 80px, hairline border, standard 8px radius.
- **Switch Toggle (`{components.switch-track}`):** Pill track for course publishing toggle or settings.

### Quiz Single & Multiple Choice (FR-Q04)

- **Question Container:** White card, `{spacing.lg}` padding.
- **Answer Options (`{components.quiz-option-card}`):**
  - Flex container with 12px gap.
  - Single Choice: `{components.radio-item}` (circular, 18px). Selected card turns to `{components.quiz-option-card-selected}`.
  - Multiple Choice: `{components.checkbox}` (square, 18px).
- **Feedback States (Quiz Review / Results):**
  - Correct Answer: Background `{colors.success-soft}`, border `{colors.success-border}`.
  - Wrong Answer: Background `{colors.error-soft}`, border `{colors.error-border}`.

---

## 6. Tabs System Spec

- **Underline / Line Tabs (`{components.tabs-list-line}` + `{components.tab-trigger-line}`):**
  - Used for Course Builder views (Curriculum / Settings / Publish Review) and Account Settings.
  - Active state creates a solid 2px line in `{colors.primary}` (#111111) at the bottom.
- **Pill / Segmented Tabs (`{components.tabs-list-pill}` + `{components.tab-trigger-pill}`):**
  - Used for Table filters (e.g. All / Published / Drafts / Archived).
  - Active tab has white canvas pill with subtle drop shadow.

---

## 7. Data Tables & Lists Spec (`@tanstack/react-table`)

- **Structure:** Wrap tables inside `{components.data-table-container}` with a subtle 1px border.
- **Header Row (`{components.data-table-header}`):** Subtle gray `#f8f9fa` surface, 40px height, uppercase 12px bold labels in `{colors.muted}`.
- **Data Rows (`{components.data-table-row}`):** Exactly 48px height, white background, bottom hairline divider. On hover, background shifts to `{colors.surface-soft}`.
- **Actions Column:** Right-aligned icon button (`MoreHorizontal` 16px) opening a shadcn `DropdownMenu`.
- **Pagination Footer (`{components.data-table-pagination}`):** Contains "Showing X of Y results", page size selector, and Previous/Next buttons.
- **Skeleton State:** Render 5 skeleton bars (`h-10 w-full rounded-md bg-muted/20 animate-pulse`) during React Query fetch.

---

## 8. Course Builder & Drag-and-Drop (`@dnd-kit/react`)

- **Hierarchy Tree:**
  - **Chapter Level:** Displayed as `{components.builder-chapter-card}`. Features accordion trigger, chapter title, "Add Lesson" button, and drag handle.
  - **Lesson Level:** Nested inside chapter cards using `{components.builder-lesson-row}`. White background with 1px border.
- **Drag-and-Drop Interaction:**
  - Left-most element is `GripVertical` icon (`{components.dnd-drag-handle}`).
  - While dragging, the active item acquires opacity 0.5 and subtle elevation shadow (`shadow-md`).
  - Drop targets display a 2px horizontal line `{components.dnd-drop-indicator}` in `{colors.ink}`.

---

## 9. Publish Checklist Spec (Business Rule `BR-CRS-02`)

- **Card Surface:** Uses `{components.publish-checklist-card}` placed on the Course Settings / Review tab.
- **Checklist Items:**
  - **Valid / Passed:** Icon `CheckCircle2` (16px, `{colors.success}`), text in `{colors.body}`.
  - **Invalid / Pending:** Icon `XCircle` (16px, `{colors.error}`), text in `{colors.error}`, paired with a small secondary shortcut button (e.g., "Add at least 1 lesson").
- **Publish Button CTA:** Centered or full-width `{components.button-primary}`. Remains `disabled` (`{components.button-primary-disabled}`) until 100% of checklist rules pass.

---

## 10. Empty & Error States

- **Empty State Pattern (`{components.empty-state-card}`):**
  1. Centered Lucide icon (36px–48px) in `{colors.muted-soft}`.
  2. Headline in `{typography.title-sm}` (`{colors.ink}`).
  3. Short 1-sentence explanation in `{typography.body-sm}` (`{colors.muted}`).
  4. Primary CTA button (`{components.button-primary}`) to trigger creation (e.g., "Create your first course").
- **403 / 404 Error Screens:** Centered on white canvas, 48px bold display headline, clear return navigation button.

---

## 11. Video Learning Player Spec (`@vidstack/react@next`)

- **Player Container (`{components.video-player-container}`):**
  - Uses `{colors.surface-dark}` (#101010) background, 16:9 aspect ratio, 1px border (`{colors.hairline}`).
  - **Desktop:** Occupies the primary column in the 70/30 split layout.
  - **Mobile:** Sticky at top of the viewport (`top-0 z-20`) so the student can scroll lesson notes/quiz while watching.
- **Controls & Chrome (`{components.video-player-controls}`):**
  - Dark glassmorphic bar (`rgba(16, 16, 16, 0.85)` with `backdrop-blur-md`).
  - Icons for Play/Pause, Volume/Mute, Playback Speed (0.75x, 1x, 1.25x, 1.5x, 2x), Fullscreen.
  - Progress scrub track using `{colors.brand-accent}` indicator with white scrub thumb.
- **Heartbeat & Event Integration:**
  - Dispatches heartbeat `PUT /lessons/:id/progress` every 15–30s.
  - Reflects **BR-PRG-01** (≥ 90% threshold marks lesson as completed).

---

## 12. Technical Implementation & Font Loading Guide

### Font Configuration (Next.js App Router)
- **Cal Sans:** Import via `next/font/local` (or package `@calcom/cal-sans`) mapping to CSS variable `--font-cal`.
- **Inter:** Import via `next/font/google` mapping to CSS variable `--font-inter`.
- Configure `fontFamily` in Tailwind config:
  ```ts
  fontFamily: {
    cal: ['var(--font-cal)', 'Inter', 'sans-serif'],
    sans: ['var(--font-inter)', 'sans-serif'],
  }
  ```

### Tailwind CSS & shadcn/ui Mapping
- Base Canvas: `bg-background` (`#ffffff`), Text: `text-foreground` (`#111111`).
- Primary Actions: `bg-primary` (`#111111`), text `text-primary-foreground` (`#ffffff`).
- Hairline Dividers: `border-border` (`#e5e7eb`).
- Muted Text: `text-muted-foreground` (`#6b7280`).
- Subtle Surfaces: `bg-muted` (`#f8f9fa`) or `bg-accent` (`#f5f5f5`).

---

## 13. Do's and Don'ts

### Do

- Reserve `{colors.primary}` (#111111) for all primary confirm actions, never bright blues.
- Keep table rows at 48px and compact inputs at 40px to maintain professional data density.
- Map Backend Status Enums strictly to `{colors.badge-status-*}` tokens.
- Use Skeleton loaders instead of generic center-page spinners.

### Don't

- Don't use random Tailwind colors (`bg-blue-600`, `bg-purple-500`) for app UI; strictly use CSS variables and tokens defined here.
- Don't introduce heavy borders or harsh box-shadows. Elevation is achieved through soft borders (`1px solid #e5e7eb`) and subtle surface contrast (`#f8f9fa` vs `#ffffff`).
- Don't mix font weights randomly: Headlines use 600, labels 600, running text 400.

