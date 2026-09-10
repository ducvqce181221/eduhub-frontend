# EduHub Frontend Client

[![Live Web Application](https://img.shields.io/badge/Web%20App-Live%20on%20Vercel-000000?style=flat-square&logo=vercel)](https://eduhub-frontend-xi.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Live%20on%20Render-46E3B7?style=flat-square&logo=render)](https://eduhub-backend-d6vk.onrender.com/api/v1/health)
[![Swagger Docs](https://img.shields.io/badge/Swagger-Interactive%20Docs-85EA2D?style=flat-square&logo=swagger)](https://eduhub-backend-d6vk.onrender.com/api/docs)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

The modern, responsive web application for **EduHub** — a high-performance Learning Management Platform. Designed with a **Notion-inspired aesthetic** (warm paper canvas, hairline borders, and purposeful Notion Blue accents), supporting bilingual localization (EN/VI), responsive themes (Light/Dark), and role-tailored workspaces for Students, Teachers, and Administrators.

---

## 🌐 Live Deployments

- **Production Web Client:** [https://eduhub-frontend-xi.vercel.app](https://eduhub-frontend-xi.vercel.app)
- **Backend API Base:** [https://eduhub-backend-d6vk.onrender.com/api/v1](https://eduhub-backend-d6vk.onrender.com/api/v1)
- **Interactive Swagger Documentation:** [https://eduhub-backend-d6vk.onrender.com/api/docs](https://eduhub-backend-d6vk.onrender.com/api/docs)

---

## 🎨 Design Philosophy & Tech Stack

EduHub rejects generic "AI-slop" design tropes (no noisy glassmorphism or floating neon gradients). Instead, it adopts a calm, utilitarian Notion-inspired visual language crafted for readability and focus:

| Layer | Technology | Role in EduHub |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 | Server Components, streaming SSR, URL-based sub-path routing, and proxy rewrites |
| **Styling** | Tailwind CSS v4 + Radix UI Primitives | Clean tokenized layout, hairline borders, and accessible primitives via `shadcn` |
| **Icons & Typography** | Lucide React + Inter & Cal Sans | Crisp semantic iconography and clean tabular typography |
| **Server State & Cache** | `@tanstack/react-query` v5 | Intelligent caching, background revalidation, and optimistic UI mutations |
| **URL State Synchronization** | `nuqs` | Type-safe URL query-parameter syncing for course search, category filters, and pagination |
| **Forms & Schema Validation** | `react-hook-form` + `zod` | Declarative validation schemas mirrored from backend DTO contracts |
| **Drag & Drop** | `@dnd-kit/react` | Accessible curriculum tree reordering with manual save bar |
| **Video Player** | `@vidstack/react` | Custom video player with anti-download protection, student watermark, and speed control |
| **Toast Notifications** | `sonner` | Sleek async promise toasts with action triggers |
| **Bot Protection** | Cloudflare Turnstile | Embedded invisible/managed CAPTCHA widget on login, register, and password recovery |
| **Analytics & Telemetry** | `@vercel/analytics` + `@vercel/speed-insights` | Real-time Web Vitals, performance profiling, and visitor analytics |
| **Testing** | Vitest 4 + Testing Library | 42 unit and integration test suites (207 passed tests) |

---

## 🌟 Key Features & Role Portals

### 1. Public Discovery & Catalog (`/(public)`)
- **Unified Discovery Portal (`/`):** Hero banner, categorized tracks, and filterable catalog with category pills and difficulty levels (`Beginner`, `Intermediate`, `Advanced`).
- **Promotional Banners:** Auto-advancing 3:1 carousel displaying platform announcements and featured courses.
- **Course Preview Modal:** Udemy-style guest video preview allowing prospective students to sample the first lesson without enrollment.
- **Bilingual Support (EN / VI):** URL sub-path internationalization (`/en/...` and `/vi/...`) with cookie persistence and `Accept-Language` API negotiation.
- **Theme Mode:** Seamless light and dark mode with persistent user preference.

### 2. Student Learning Experience (`/(student)`)
- **Distraction-Free Video Player:** Custom playback controls, 10s skip, keyboard shortcuts, volume slider, resolution indicator (1080p source), and floating student watermark to deter screen recording.
- **Anti-Download Protection:** Right-click prevention and hidden media source URLs.
- **Heartbeat Progress Tracking:** Automatic periodic progress synchronization (`PUT /lessons/:id/progress`) with backend watch-time clamping ($\ge 90\%$ completion threshold).
- **Interactive Quizzes:** Single-choice quiz interface with instant server-side grading and masked results feedback.

### 3. Teacher Course Studio (`/(teacher)`)
- **Course Builder & Curriculum Tree:** Drag-and-drop chapter and lesson reordering with unsaved changes detection and batch commit.
- **Direct S3 Binary Upload:** Presigned upload directly to Cloudflare R2 with real-time percentage progress bar.
- **3-Tier Asset Manager:** Upload new media, reuse existing assets from the Teacher Library (with SHA-256 duplicate warning), or attach verified external resources.
- **Publish-Ready Checklist:** Interactive validation modal checking the 5 mandatory publishing criteria before taking a course live.

### 4. Administrator Control Center (`/(admin)`)
- **User Management:** Filter, search, provision instructors, toggle active status, and assign roles.
- **Referential-Safe Category Management:** Category creation with automated slug generation and delete protection (surfaces 409 Conflict if courses are attached).
- **Course Oversight:** Platform-wide review with one-click archiving for policy violations.
- **System Announcements:** Dispatch platform-wide broadcast notifications to all registered learners.
- **Banner Management:** Admin control to upload, reorder, and activate promotional banners with live aspect ratio validation.

---

## 📁 Project Structure

```
app/
├── [locale]/
│   ├── (admin)/admin/          # Banners, categories, courses, notifications, users
│   ├── (public)/               # Home catalog, course detail, auth (login, register, forgot/reset)
│   ├── (student)/              # Enrollments, learning player, profile, change password
│   ├── (teacher)/              # Course studio, curriculum builder, enrolled learners
│   ├── layout.tsx              # Root HTML, Providers, Header, Banner, Footer
│   └── page.tsx                # Unified Course Discovery & Catalog portal
├── components/                 # UI primitives (buttons, dialogs, inputs, tables, video player)
├── hooks/                      # Custom hooks (use-auth, use-theme, use-debounce, etc.)
├── lib/
│   ├── api/                    # API client wrapper, envelope unwrapping, token refresh
│   ├── auth/                   # Token state, auth context, route guard utilities
│   ├── i18n/                   # Translation dictionaries (EN / VI) and localization helpers
│   └── theme/                  # Theme provider and dark mode script
└── tests/unit/                 # 42 Vitest test suites covering all pages and components
```

---

## 📋 Prerequisites

- **Node.js:** `v20.x` or later (LTS recommended)
- **Package Manager:** `pnpm` (`v10.x` or `v11.x`)
- **Running Backend API:** An active instance of `eduhub-backend` (locally on port `5000` or the live Render API)

---

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/ducvqce181221/eduhub-frontend.git
cd eduhub-frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Set the environment variables:
```env
# Public API URL (empty or localhost:5000 in dev)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend URL used by Next.js rewrites proxy (prevents CORS issues in SSR/client)
BACKEND_INTERNAL_URL=http://localhost:5000

# Cloudflare Turnstile Site Key (use 1x00000000000000000000AA for testing always-passing widget)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

> **Note on Rewrites Proxy:** In `next.config.ts`, requests to `/api/v1/:path*` are automatically proxied to `BACKEND_INTERNAL_URL`. When developing locally or hosting on Vercel, this eliminates browser CORS restrictions and keeps cookie authentication seamless.

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The default route redirects to `http://localhost:3000/en`.

---

## 🔑 Demo Credentials

To test different role perspectives on the live demo or locally:

| Role | Email | Password | What to Explore |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eduhub.dev` | `Password123!` | Access `/en/admin` to manage users, categories, banners, and broadcast notifications |
| **Teacher** | `teacher1@eduhub.dev` | `Password123!` | Access `/en/me/courses` to create courses, upload videos, and build quizzes |
| **Student** | `student1@eduhub.dev` | `Password123!` | Access `/en/enrollments` and `/en/learn/:id` to stream lessons and take quizzes |

---

## 🧪 Testing

The frontend includes **42 test suites with 207 automated tests** testing components, route guards, API clients, and user flows:

```bash
# Run the full Vitest test suite
pnpm test

# Run tests in interactive watch mode
pnpm run test:watch
```

---

## 📜 Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Start Next.js development server on `http://localhost:3000` |
| `pnpm build` | Build the optimized production bundle |
| `pnpm start` | Run the compiled Next.js production server |
| `pnpm lint` | Run ESLint to check code quality |
| `pnpm test` | Run Vitest unit & component test suite |
| `pnpm run test:watch` | Run Vitest in watch mode |

---

## ☁️ Production Deployment (Vercel)

The frontend is optimized for zero-configuration deployment on **Vercel**:

1. Import the repository into your Vercel Dashboard.
2. Ensure the Framework Preset is set to **Next.js**.
3. Set the Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://eduhub-backend-d6vk.onrender.com`
   - `BACKEND_INTERNAL_URL` = `https://eduhub-backend-d6vk.onrender.com`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = *your production Turnstile site key*
4. Deploy! Vercel automatically builds the application and provides real-time Speed Insights and Web Analytics.
