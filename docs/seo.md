# SEO

## What is in place

- **Global metadata** (`app/layout.tsx`): title template (`%s | Incial`), description, canonical, Open Graph,
  Twitter card, robots and viewport/theme colour. `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`.
- **Per-route metadata**: client-rendered pages cannot export `metadata`, so each has a small server
  `layout.tsx` that does (`about`, `services`, `careers`, `learn-together`, `products`). Blogs and case
  studies export `metadata` / `generateMetadata` with canonical URLs, article Open Graph and Twitter images.
- **Structured data**: `Organization` JSON-LD in the root layout.
- **`/robots.txt`** (`app/robots.ts`): allows the site, disallows `/admin` and `/api/`, points to the sitemap.
- **`/sitemap.xml`** (`app/sitemap.ts`): static routes plus every blog post and case study. Admin saves
  revalidate it.
- **Admin** is `noindex` and blocked in robots.

## Known gaps

- The home page (`/`) is fully client-rendered, so crawlers see little server HTML. Consider rendering the
  intro/services copy on the server.
- `/blogs` renders a blank placeholder until device detection finishes (`useDevice`), so the post list is not
  in the server HTML. Render the list on the server and switch layout with CSS.
- Per-post `BlogPosting` / per-case `Article` JSON-LD is not added yet.
- Remote ImageKit images are served unoptimised (`images.unoptimized`); use ImageKit URL transforms
  (`?tr=w-800,f-auto`) for responsive sizes.

## Checklist for new pages

1. Export `metadata` with a unique `title` and `description` (or add a server `layout.tsx`).
2. Set `alternates.canonical`.
3. Add the route to `STATIC_ROUTES` in `app/sitemap.ts`.
4. One `<h1>` per page, and meaningful `alt` text on images.
