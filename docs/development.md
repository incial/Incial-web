# Development guide

## Prerequisites

- Node.js ≥ 20.9
- pnpm (the only lockfile is `pnpm-lock.yaml`; do not use npm or yarn here)
- A Neon database, ImageKit account, Google OAuth client and Resend key for full functionality
  (the public pages that read JSON work without any of them)

## Setup

```bash
pnpm install            # also runs `prisma generate`
cp .env.example .env    # then fill in values (see deployment.md)
pnpm dev                # http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | development server |
| `pnpm build` | `prisma generate` + production build |
| `pnpm start` | production server (Node heap capped at 512 MB for small hosts) |
| `pnpm lint` | ESLint (must have 0 errors) |
| `pnpm typecheck` | `tsc --noEmit` |

`scripts/upload.mjs` and `scripts/upload-directory.mjs` push files to ImageKit through the running app;
they need `ADMIN_SECRET` and the dev server on `localhost:3000`.

## Before you open a pull request

1. `pnpm typecheck` and `pnpm lint` pass with no errors.
2. Open the pages you touched on desktop **and** a ≤768px viewport (the mobile layout is separate code).
3. If you changed content structure, update the types in `lib/dataLoader.ts` and the admin page together.

## Conventions

- **Server components by default**; add `"use client"` only for state, effects or browser APIs.
- **No `any`**. Type API responses, or use `unknown` and narrow.
- **Images**: use `next/image` with explicit sizes; remote hosts must be listed in `next.config.ts`.
  Run every image URL from data through `normalizeImageUrl`/`pickImage`.
- **Secrets**: only from environment variables. Never add a fallback value for a secret.
- **Server actions and route handlers are public**. Check the admin session inside every mutation.
- **Animation**: animate `transform`/`opacity`; respect reduced motion.
- **Dead code**: delete it rather than commenting it out; git keeps history.
- **Barrels**: only the existing `index.ts` files in `components/*` and `hooks/`; don't add new barrels.
- Commit messages: `type: description` (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`).

## Known lint warnings (technical debt)

`react-hooks/set-state-in-effect` is set to `warn` in `eslint.config.mjs`. The flagged effects read
`sessionStorage`/viewport size after mount to avoid hydration mismatches. Converting them to
`useSyncExternalStore` is a worthwhile follow-up.
