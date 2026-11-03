# Architecture

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | framer-motion; `ogl` (WebGL ribbons); `d3-geo` + `d3-timer` (rotating globe) |
| Admin auth | NextAuth v5 (Google OAuth, email allow-list) |
| Content | JSON files in `data/` (see [admin-panel.md](admin-panel.md)) |
| Database | Neon Postgres via Prisma 7 + `@prisma/adapter-neon` (contact submissions, `Service`) |
| Images | ImageKit CDN; uploads go through `/api/upload` |
| Email | Resend (contact-form notifications) |
| Drag-and-drop | `@dnd-kit` (admin reordering only) |

## Folder layout

```
app/
  (marketing)/      public pages: about, blogs, case-studies, careers, learn-together, services
  (admin)/admin/    admin panel pages (client components, behind the auth proxy)
  api/              route handlers: admin/[section], upload, contact, download-brochure, auth
  products/         public products page
  page.tsx          home — a client-driven, full-screen sequence of sections
  layout.tsx        root layout, fonts, global metadata, Organization JSON-LD
  robots.ts, sitemap.ts
components/
  admin/            admin shell, sidebar, ImageUpload, visibility toggle
  features/         page-specific pieces (blogs, home, learn-together, services)
  sections/         the home-page sections (greetings, services, trust, clients, contact…)
  mobile/           the dedicated mobile layout (≤768px)
  layout/           Header, Footer, NavMenu
  ui/               small reusable pieces (Breadcrumbs, Ribbons, SocialLinks, ClientMarquee)
data/               editable content (JSON) — the CMS storage
lib/                dataLoader, imageUtils, adminAuth, adminApi, prisma, scrollLock, actions/
hooks/              useDevice (mobile detection)
prisma/             schema.prisma (Service, ContactSubmission)
scripts/            upload.mjs, upload-directory.mjs (ImageKit helpers)
docs/               this documentation
```

Path alias: `@/*` maps to the repository root (see `tsconfig.json`).

## Rendering model

- **Home (`/`)** is one client component that walks through phases (`scrolling → trust → client → contact`)
  with animated card transitions. Hash links (`/#trust`) jump between phases.
- **Mobile (≤768px)**: pages switch to components in `components/mobile/` via `useDevice`.
- **Blogs and case studies** are server components. They read `data/*.json` on every request
  (`dynamic = "force-dynamic"`) so admin edits show immediately, then hand data to client components.
- **Admin pages** are client components that load and save through `/api/admin/[section]`.

## Data flow

```
Admin UI ──PUT /api/admin/{section}──▶ data/{section}.json ──▶ lib/dataLoader ──▶ public pages
                (auth + validation)         (atomic write)       (image normalising)
```

Contact form: `ContactSection → POST /api/contact → Prisma (ContactSubmission) → Resend email`.

## Routes

| Path | Notes |
| --- | --- |
| `/`, `/about`, `/services`, `/products`, `/careers`, `/learn-together` | marketing pages, can be disabled in admin → Settings |
| `/case-studies`, `/case-studies/[slug]` | server-rendered from `casestudies.json` |
| `/blogs`, `/blogs/[slug]` | server-rendered from `blogs.json` |
| `/admin/*` | protected by `proxy.ts` (Next.js 16 name for middleware); `/admin/login` is public |
| `/api/admin/[section]` | `GET` public (content is public), `PUT` requires admin |
| `/api/upload` | admin-only image upload to ImageKit |
| `/api/contact` | public, rate-limited |
| `/api/download-brochure` | streams `public/pdf/Brochure.pdf` |
| `/sitemap.xml`, `/robots.txt` | generated, see [seo.md](seo.md) |

## Section visibility

`data/sections.json` holds an `enabled` flag per section (`about`, `blogs`, `casestudies`, `careers`,
`products`, home phases…). Pages and the nav menu read it so an admin can hide a section without a deploy.
