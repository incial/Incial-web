# Deployment

## Environment variables

Copy `.env.example`. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon Postgres (contact submissions, services) |
| `AUTH_SECRET` | **yes in production** | NextAuth signing secret. If missing, a random per-process secret is used and admin sessions reset on every restart |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | yes | admin sign-in |
| `ADMIN_GOOGLE_EMAILS` | yes | allow-list for `/admin`; empty = nobody |
| `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | for uploads | admin image uploads |
| `NEXT_PUBLIC_SITE_URL` | recommended | canonical URLs, sitemap, Open Graph |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | for email | contact notifications (submissions are saved to the DB regardless) |
| `ADMIN_SECRET` | optional | enables bearer-token auth for scripts; unset = disabled |

There are **no default secrets** in the code. A missing secret disables the feature instead of falling back.

## Build and run

```bash
pnpm install --frozen-lockfile   # pnpm only; the host must support pnpm (corepack enable)
pnpm build
pnpm start
```

`pnpm start` caps Node's heap at 512 MB for small hosts (for example Hostinger). Raise it in `package.json`
if the host has more memory.

## Content persistence — read this before every deploy

Admin edits are written to `data/*.json` on the running server. Consequences:

- Production and local content are separate. To pull the live image URLs into a local checkout, read
  `https://<site>/api/admin/<section>` and copy the fields you need.
- If your deploy replaces the `data/` directory with the repository's version, **it overwrites the edits
  made in the production admin**. Either exclude `data/` from deploys, or refresh the repo's `data/`
  files from production first.
- Serverless hosts with a read-only or ephemeral filesystem (Vercel) cannot persist these writes. Move the
  content into the database before deploying there.

## Security headers

`next.config.ts` sets HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy` and
`Permissions-Policy`, and disables the `X-Powered-By` header. A Content-Security-Policy is not set yet
(the app uses inline scripts and styles) — adding a nonce-based CSP is a recommended hardening step.

## Post-deploy checklist

- [ ] `/admin` redirects to the login page when signed out
- [ ] Sign in with an allow-listed Google account; saving a section works
- [ ] `/robots.txt` and `/sitemap.xml` show the production domain
- [ ] Submit the contact form; check the database row and the email
- [ ] Brochure download works (`/api/download-brochure`)
