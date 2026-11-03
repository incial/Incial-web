# Incial Web

Marketing website and admin panel for [Incial](https://incial.com), a creative digital agency.
Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma + Neon, NextAuth and ImageKit.

## Quick start

```bash
pnpm install
cp .env.example .env     # fill in the values
pnpm dev                 # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `pnpm dev` | development server |
| `pnpm build` / `pnpm start` | production build / server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |

## What's inside

- **Public site**: animated home sequence, about, services, products, case studies, blogs, careers,
  learn-together; dedicated mobile layout.
- **Admin panel** at `/admin` (Google sign-in, allow-listed emails): edit content, upload images, toggle sections.
- **API**: content (`/api/admin/[section]`), uploads, contact form, brochure download.

## Documentation

All docs live in [`docs/`](docs/README.md):
[architecture](docs/architecture.md) ·
[admin panel](docs/admin-panel.md) ·
[development](docs/development.md) ·
[deployment](docs/deployment.md) ·
[SEO](docs/seo.md) ·
[performance](docs/performance.md) ·
[maintenance](docs/maintenance.md)

> **Heads-up:** content is stored in `data/*.json` on the server, so production and local copies diverge.
> Read [deployment.md](docs/deployment.md#content-persistence--read-this-before-every-deploy) before deploying.
