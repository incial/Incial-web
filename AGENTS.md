# AGENTS.md — Engineering Guidelines & Guardrails for `incial-web`

This file defines mandatory operating guardrails and senior-engineering standards for AI coding agents, sub-agents, and contributors working in `incial-web`. Follow these rules alongside [`docs/architecture.md`](docs/architecture.md), [`docs/development.md`](docs/development.md), [`docs/deployment.md`](docs/deployment.md), [`docs/admin-panel.md`](docs/admin-panel.md), and [`docs/performance.md`](docs/performance.md).

---

## 1. Project Snapshot & Critical Boundaries

- **Stack**: Next.js 16 (`--webpack` builds), React 19, TypeScript (`strict: true`), Tailwind CSS v4, Prisma 7 (`@prisma/adapter-neon` + Neon serverless Postgres), NextAuth v5 (Google OAuth), Amazon S3 (`@aws-sdk/client-s3`), Resend, `framer-motion`, `ogl`, `d3-geo` + `d3-timer`, `lenis`.
- **Package Manager**: **pnpm only** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, Node `>= 20.9.0`). Never use `npm` or `yarn`, and never commit `package-lock.json` or `yarn.lock`.
- **Path Alias**: `@/*` maps to the repository root (`tsconfig.json`).
- **Two Separate Data Stores**:
  1. **CMS JSON files** in `data/*.json` (`about`, `clients`, `trust`, `blogs`, `services`, `casestudies`, `products`, `sections`, plus `data/media-manifest.json`) — edited via `/admin/*` -> `PUT /api/admin/[section]`, read via `lib/dataLoader.ts` or `/api/admin/[section]`.
  2. **Neon Serverless Postgres** via Prisma (`prisma/schema.prisma`: `Service`, `ContactSubmission`) — accessed through `@/lib/prisma`, `lib/actions/service.actions.ts`, and `app/api/contact/route.ts`.
- **Dual UI Architecture**: Desktop views (`app/(marketing)`, `components/sections`, `components/features`) and dedicated mobile views (`components/mobile/`, switched via `hooks/useDevice.ts` at `<= 768px`).
- **Host Constraints**: `pnpm start` runs Node with `--max-old-space-size=512` (512 MB heap cap for small hosts). Avoid heavy runtime libraries and in-memory buffering of large files.

---

## 2. Senior Software Engineer Approach

Treat every task as production software engineering, not quick patching:

1. **Explore & Design Before Editing**
   - Read the affected routes, loaders, types, validators, and docs first. Do not invent field names, API contracts, or file paths.
   - Reuse existing helpers (`lib/imageUtils.ts`, `lib/uploadRules.ts`, `lib/adminAuth.ts`, `lib/dataLoader.ts`, `lib/s3.ts`, `lib/mediaStore.ts`) instead of duplicating logic.
   - When adding or modifying a CMS content field, update all four layers together: `data/*.json` shape, `lib/dataLoader.ts` types, `app/api/admin/[section]/route.ts` validation, and the `/admin/<section>` UI.
2. **Server-First Boundaries**
   - Keep components as **Server Components by default**. Add `"use client"` only when React state, effects, browser APIs, or interactive handlers are needed.
   - Never import server-only modules (`fs`, `path`, `@/lib/prisma`, `@/lib/s3`, `@/lib/mediaStore`, `process.env` secrets) into Client Components. Use client-safe utilities like `lib/imageUtils.ts` on the client.
3. **Strict Type Safety & Input Validation**
   - **Zero `any`**: Use explicit interfaces or `unknown` with runtime type narrowing.
   - Validate all external inputs at API and Server Action boundaries (types, lengths, URL hosts, allowed enums, file MIME/size).
   - Never swallow errors silently in mutations; log server-side errors with context and return sanitized error responses to clients.
4. **Performance, UI & Accessibility**
   - **Animations**: Animate only GPU-composited `transform` and `opacity`; throttle scroll work with `requestAnimationFrame` (`{ passive: true }`); prefer `IntersectionObserver`; respect `prefers-reduced-motion`; clean up listeners, timers, and RAFs on unmount.
   - **Images & Media**: Use `next/image` where applicable, pass CMS image URLs through `normalizeImageUrl` / `pickImage` (`lib/imageUtils.ts`), and ensure remote hosts are declared in `next.config.ts`. Keep local `public/` assets lightweight (`<= ~500 KB`); large media belongs in S3. Stream large downloads (see `app/api/download-brochure/route.ts`).
   - **Responsive & Accessible**: Verify desktop (`>= 1025px`), tablet (`641-1024px`), and mobile (`<= 768px` / `components/mobile/`). Maintain semantic HTML, keyboard navigation (`Tab`, `Enter`, `Escape`), visible focus rings, `alt` text, and WCAG AA contrast.
5. **Code Hygiene**
   - Delete dead code instead of commenting it out.
   - Do not create new barrel `index.ts` files (only keep the existing ones in `components/` and `hooks/`).
   - Keep ESLint `react-hooks/set-state-in-effect` warnings from growing; prefer `useSyncExternalStore` for new mount/viewport/storage subscriptions.
6. **Definition of Done (Verification Gate)**
   - After final edits, run and verify passing:
     - `pnpm typecheck`
     - `pnpm lint` (0 errors)
     - `pnpm build` (required whenever changing routes, `next.config.ts`, `prisma/schema.prisma`, server/client boundaries, or dependencies)
   - Only claim checks or builds passed if you ran them after your last edit and observed zero errors.

---

## 3. Security & Authentication Guardrails (Non-Negotiable)

- **Fail-Closed Admin Auth**:
  - `proxy.ts` (Next.js 16 middleware) redirects unauthenticated `/admin/*` page visits to `/admin/login`, **but** API routes and Server Actions are publicly reachable HTTP endpoints.
  - Every mutating route in `app/api/admin/**`, `app/api/upload/**`, and every mutating Server Action in `lib/actions/**` **MUST** enforce `validateAdminAuth(req)` (`lib/adminAuth.ts`) or `auth()` (`auth.ts`) before reading/writing state.
- **No Auth Bypasses or Mock Sessions**:
  - Never commit debug bypass routes with hardcoded sessions (such as temporary local admin routes) or weaken `ADMIN_GOOGLE_EMAILS` allow-listing in `auth.ts`.
  - Never add hardcoded fallback secrets for `AUTH_SECRET`, `ADMIN_SECRET`, `GOOGLE_CLIENT_SECRET`, or signing keys. A missing secret must disable the feature/fail closed.
  - Bearer token checks must use constant-time comparison (`safeEqual` in `lib/adminAuth.ts`).
- **Secrets Hygiene**:
  - **NEVER** read, print, log, echo, or commit `.env`, `.env.local`, or secret values (`DATABASE_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `ADMIN_SECRET`, `RESEND_API_KEY`).
  - Only document variable names and placeholder examples in `.env.example`.
- **XSS, SSRF & Payload Limits**:
  - Escape user-supplied strings rendered in HTML/emails (`escapeHtml` in `app/api/contact/route.ts`).
  - Enforce body size limits (`MAX_BODY_BYTES = 2 MB` on `/api/admin/[section]`, `MAX_IMAGE_BYTES = 10 MB`, `MAX_VIDEO_BYTES = 50 MB` in `lib/uploadRules.ts`).
  - Reject expiring hotlinked URLs (e.g., `media.licdn.com` in `/api/admin/[section]`).

---

## 4. Database Guardrails (Neon Serverless Postgres + Prisma 7)

The database (`Service`, `ContactSubmission`) uses Neon Postgres with `@prisma/adapter-neon` and `ws`.

1. **Use the Singleton Client**:
   - Always import `prisma` from `@/lib/prisma`. Never instantiate `new PrismaClient()` inside route handlers, server actions, or components (prevents connection exhaustion in serverless/dev HMR).
2. **Prisma Codegen & Config**:
   - Generated client output lives at `lib/generated/prisma` (gitignored) and `prisma.config.ts` reads `DATABASE_URL`.
   - After editing `prisma/schema.prisma`, always run `npx prisma generate` (or `pnpm build`) and run `pnpm typecheck`.
3. **Environment & Branch Isolation**:
   - Never run migrations, seeds, or ad-hoc queries against the production `DATABASE_URL` from a local dev or feature branch.
   - Use isolated Neon branches for `dev` and feature testing (see `.neon` and `.claude/skills/neon-postgres/SKILL.md`).
4. **Destructive Operations Forbidden Without Explicit Human Approval**:
   - **NEVER** run `prisma db push --force-reset`, `prisma migrate reset`, `DROP TABLE`, `TRUNCATE`, or un-scoped `DELETE`/`UPDATE` statements autonomously.
   - Prefer additive, backward-compatible migrations (add nullable column -> deploy code -> backfill -> add constraint) so zero-downtime rollouts between `dev` and `main` never fail.
5. **PII & Access Control**:
   - `ContactSubmission` stores user PII (`name`, `email`, `phone`, `company`, `message`). Never expose `ContactSubmission` records in public endpoints, client props, logs, or error messages.
   - Every write in `lib/actions/service.actions.ts` must verify `isAdmin()` and call `revalidatePath()` after mutation.

---

## 5. Amazon S3 & Media Storage Guardrails

Media storage (`lib/s3.ts`, `lib/mediaStore.ts`, `lib/uploadRules.ts`, `app/api/upload/route.ts`, `app/api/admin/media/route.ts`, `app/media/[...key]/route.ts`) backs all uploaded images and videos.

1. **Keep the Bucket Private**:
   - The S3 bucket is **private**. Never change bucket policies/ACLs to public-read, and never grant wildcard `s3:*` permissions.
   - Browsers access files through `/media/<key>` (`app/media/[...key]/route.ts`) or an explicit CDN `S3_PUBLIC_URL` (e.g., CloudFront).
2. **Strict Key Namespace (`S3_ROOT = "incial-web"`)**:
   - All app objects must live under `incial-web/` (e.g., `incial-web/images/about/...`, `incial-web/clients/...`, `incial-web/videos/products/...`).
   - Reserved internal prefixes (`incial-web/backups/`, `incial-web/_check/`) are excluded by `HIDDEN` in `lib/mediaStore.ts` and **must never** be listed, modified, or deleted by media-library code or agents.
3. **Path Traversal & File Validation**:
   - Always validate folders with `cleanFolder()` / `FOLDER_PATTERN` (`lib/uploadRules.ts`) and object keys with `isSafeKey()` (`startsWith("incial-web/")`, no `..`, `SAFE_KEY`).
   - Always validate uploads with `checkFile(file)`: extension must come from the `ALLOWED_TYPES` MIME map (never trust user filenames), respecting `MAX_IMAGE_BYTES` (10 MB) and `MAX_VIDEO_BYTES` (50 MB).
4. **Immutable Keys — Never Overwrite in Place**:
   - Objects are served with `Cache-Control: public, max-age=31536000, immutable`.
   - **Never overwrite an existing S3 key in place.** To replace an asset, upload to a newly generated unique key (`img|vid-<timestamp>-<hex>.<ext>`), update all references via `replaceInContent()`, revalidate paths (`revalidatePath("/", "layout")`), and only then delete the old key.
5. **Referential Integrity Before Deletion**:
   - Never delete an S3 object without checking `scanUsage(config)` first. If a key is referenced in any `data/*.json`, deletion must be blocked (`409` in `DELETE /api/admin/media`).
   - Agents must **never** delete S3 objects or run bulk S3 deletions autonomously without explicit user approval.
6. **Manifest & Atomic Writes**:
   - Route all app S3 uploads/deletes through `putFile()` / `deleteFile()` in `lib/mediaStore.ts` so `data/media-manifest.json` stays synchronized (the IAM user may lack `s3:ListBucket` and fall back to manifest index mode).
   - Write `data/*.json` and `data/media-manifest.json` atomically via temp file + `fs.rename`.
7. **Migration & Bulk Scripts**:
   - Scripts touching S3 (`scripts/migrate-to-s3.mjs`, `scripts/upload*.mjs`) must default to **dry-run** and require explicit `--apply` flags for mutations, backing up `data/*.json` to `incial-web/backups/data/<timestamp>/` before rewriting URLs. Never hardcode bucket names, regions, or AWS keys.

---

## 6. CMS Data (`data/*.json`) & Environment Divergence

- Admin edits on production write to `data/*.json` on the live server filesystem (`docs/deployment.md`).
- **Local `data/*.json` and production `data/*.json` diverge.**
- Agents must **not** overwrite or reformat unrelated `data/*.json` files while working on code changes.
- Before merging `dev` -> `main` or deploying, remind the user/maintainer to check whether production `data/*.json` edits need to be pulled (`GET /api/admin/<section>`) or excluded from deployment so live CMS edits are not overwritten.

---

## 7. Branching Strategy & Git Hygiene

| Branch | Purpose | Rules |
| --- | --- | --- |
| `main` | Production | **Never commit directly, amend, or force-push.** Accepts tested PRs from `dev` (or urgent `hotfix/*` PRs) after `typecheck`, `lint`, `build`, DB migration check, and `data/*.json` sync check. |
| `dev` | Integration / Staging | Default development target. Keep green (`pnpm typecheck && pnpm lint && pnpm build`). |
| `feat/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*` | Short-lived task branches | Branch off `dev`, keep diffs scoped to one concern, merge back via PR using [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). |
| `hotfix/*` | Urgent production fixes | Branch off `main`, verify with full build, merge to `main` **and** back-merge into `dev`. |

- **Commit Format**: Conventional Commits — `type(scope): concise summary` (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`).
- **Pre-Commit Hygiene**: Check `git status` and `git diff` before staging. Never stage `.env*` (except `.env.example`), `*.tmp`, `lint_output.txt`, `.ml-*.png` / local screenshots, or unauthenticated debug routes.

---

## 8. Sub-Agent & Multi-Agent Orchestration Rules

When decomposing work across multiple sub-agents or parallel workers:

1. **Disjoint File Ownership (Single-Writer Rule)**
   - Never assign two concurrent write-enabled sub-agents to the same file. In particular, serialize ownership of shared cross-cutting files: `package.json`, `prisma/schema.prisma`, `lib/dataLoader.ts`, `next.config.ts`, `auth.ts`, `proxy.ts`, and `data/*.json`.
   - Use isolated workspaces (`share` / `branch`) when multiple agents write simultaneously, and reconcile diffs at the coordinator level.
2. **Role Boundaries**
   - **Research / Audit Sub-Agents (Read-Only)**: Explore code, trace data flows, and report exact file paths, line numbers, symbol names, and observed outputs. Never infer unverified behavior or edit files.
   - **Frontend / UI Sub-Agents**: Own `app/(marketing)`, `app/products`, `components/features`, `components/sections`, `components/mobile`. Must maintain desktop/mobile parity (`<= 768px`), `lib/imageUtils.ts` URL normalization, and `docs/performance.md` animation rules.
   - **Backend / Infra Sub-Agents**: Own `app/api`, `app/media`, `lib/actions`, `lib/s3.ts`, `lib/mediaStore.ts`, `prisma/`. Must enforce fail-closed auth, input validation, atomic file writes, and S3/DB guardrails. **Forbidden** from running destructive DB commands or `--apply` S3 mutations without explicit coordinator/user approval.
   - **Verification / Review Sub-Agents**: Audit diffs against [`.github/PULL_REQUEST_REVIEW_GUIDE.md`](.github/PULL_REQUEST_REVIEW_GUIDE.md), run `pnpm typecheck`, `pnpm lint`, and `pnpm build`, and inspect security/auth boundaries.
3. **Contract Handoffs**
   - Any sub-agent modifying a shared interface (`lib/dataLoader.ts`, `lib/uploadRules.ts`, `prisma/schema.prisma`, API request/response schemas) must report the exact contract diff immediately so dependent agents update callers before integration.
4. **Parent Verification Duty**
   - A sub-agent's self-reported pass is not sufficient after merging parallel changes. The coordinator/parent agent must run `pnpm typecheck && pnpm lint` (and `pnpm build` when applicable) on the integrated working tree before reporting completion.
