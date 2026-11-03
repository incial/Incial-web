# Maintenance log

## Repository cleanup (November 2026)

### Removed code and files

| Item | Why |
| --- | --- |
| `app/data/case-studies-data.ts` | hard-coded copy of case studies; nothing imported it (`data/casestudies.json` is the source) |
| `components/features/learn-together/SecondSlide{Initial,Animated,Final}.tsx` | unused slides |
| `components/features/services/ServicesLayoutFrame.tsx`, `components/ui/DesktopOnlyScreen.tsx`, `components/layout/MarketingShell.tsx` | unused components |
| `lib/imagekitLoader.ts` | custom image loader that was never wired up |
| `config/`, `types/`, `utils/`, `context/`, `components/providers/` | unused or empty; barrels `components/index.ts`, `lib/index.ts` also unused |
| `lib/dataLoader.ts`: `loadAboutData`, `loadClientsData`, `loadTrustData`, `loadServicesData`, `loadSectionsConfig` | unused (pages read these through the API) |
| `service.actions.ts`: `getServiceById`, `checkIfServiceIsFree` | unused |
| `app/api/admin/auth/route.ts` | secret-guessing endpoint with a hard-coded default secret |
| Dead state/handlers in `AboutSection`, `ServicesSection`, `LandingSlide`, `SkillsTogetherSlide`, `Whatwexlpore` | never read |
| `scripts/replace-imagekit-urls.mjs` | one-off migration, already applied |
| `lint_output.txt`, `test-connections.js`, `FOLDER_STRUCTURE.md`, `MOBILE_OPTIMIZATION_*.md` | clutter / stale; useful parts folded into these docs |
| 8 unreferenced images in `public/` | `clients/{alan-joseph,intern-hub,livelongpala}.png`, `images/about/imgAvatar{1,2,3}.png`, `images/career.png`, `Lines.svg` |

### Dependencies

Removed: `@aws-sdk/client-s3`, `@imagekit/nodejs`, `@radix-ui/react-{dialog,switch,tabs,toast}`, `gsap`,
`sharp`, `d3`, `@types/d3`. Added: `d3-geo`, `d3-timer` (+ types), `dotenv` (dev, used by `scripts/`).

### Security fixes

- Removed hard-coded `ADMIN_SECRET` and NextAuth secret fallbacks; bearer auth uses a constant-time compare.
- Server actions that mutate services now verify the admin session.
- Upload endpoint: type allow-list, 10 MB cap, sanitised folder. Contact form: HTML-escaped email, length
  limits, rate limiting. Brochure download streams instead of buffering 80 MB.

### Modernisation

- `middleware.ts` renamed to `proxy.ts` (the Next.js 16 convention).
- `tsconfig.json` path aliases reduced to the single `@/*` mapping.
- Added `typecheck` script and `engines` field.

- Standardised on pnpm: `package-lock.json` removed, `pnpm-lock.yaml` is the single lockfile.

### Quality

- ESLint: ~100 findings → 0 errors (11 warnings). All `any` replaced with real types.
- `.env.example` is now actually committed (the old `.env*` ignore rule hid it).

## Open items

| Item | Notes |
| --- | --- |
| `react-hooks/set-state-in-effect` warnings (8) | mount/hydration syncs; refactor to `useSyncExternalStore` |
| 80 MB `public/pdf/Brochure.pdf` | compress, or host on ImageKit/object storage |
| Content stored in files | move to the database before serverless hosting; see [deployment.md](deployment.md) |
| No automated tests | add Playwright smoke tests for `/`, `/blogs`, `/case-studies`, `/admin/login` |
| No CSP header | add nonce-based CSP |
| `react-icons` | used for 5 icons only (menu, close, social brands); replace with inline SVGs to drop the package |
| Repo tooling files | `skills-lock.json`, `.claude/skills/`, `.neon` are agent/tool config; keep or remove per team preference |
