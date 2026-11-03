# Admin panel

## Access

- URL: `/admin`. Unauthenticated users are redirected to `/admin/login` by `proxy.ts` (Next.js 16 name for middleware).
- Sign-in is Google OAuth. Only addresses listed in `ADMIN_GOOGLE_EMAILS` (comma-separated) are allowed;
  an empty list denies everyone.
- Admin pages set `noindex` and are disallowed in `robots.txt`.

## Content model

Each admin page edits one JSON file in `data/`:

| Section | File | Admin page |
| --- | --- | --- |
| About (story, team, awards) | `about.json` | `/admin/about` |
| Clients and testimonials | `clients.json` | `/admin/clients` |
| Trust statistics | `trust.json` | `/admin/trust` |
| Blog posts | `blogs.json` | `/admin/blogs` |
| Case studies | `casestudies.json` | `/admin/casestudies` |
| Products | `products.json` | `/admin/products` |
| Services (page copy) | `services.json` | `/admin/services` |
| Section on/off switches | `sections.json` | `/admin/settings` |

The `Service` cards on `/services` come from the database through server actions
(`lib/actions/service.actions.ts`), not from JSON.

### Images

Each image slot uses `components/admin/ImageUpload.tsx`: upload a file (PNG/JPEG/WebP/GIF/AVIF; the picker
rejects files over 5 MB and the server enforces a hard 10 MB limit) or paste a URL. Uploads land in ImageKit under `/incial-web/<folder>` and the
returned URL is stored in the JSON.

**Case studies** have a *cover* image (list thumbnail), a *hero* image (page banner) and a free-form
*gallery* (`images[]`). If one of cover/hero is empty or still the placeholder (`case1.*`), the other is
used (`lib/imageUtils.ts → pickImage`). The list-page banner uses `heroBanner`, falling back to the
predefined `/images/case1.webp`.

**Blogs** have one main `image`, an optional `heroBanner` for the list page, and an optional gallery
(`images[]`) interleaved into the article text.

## API

`/api/admin/[section]` — `section` must be one of `about, clients, trust, blogs, services, casestudies,
products, sections`.

| Method | Auth | Behaviour |
| --- | --- | --- |
| `GET` | none (content is public) | returns the JSON file, `no-store` |
| `PUT` | admin session **or** `Authorization: Bearer $ADMIN_SECRET` | validates (blogs get full schema validation), writes atomically (temp file + rename), revalidates affected pages and the sitemap. Body limit 2 MB. |

`/api/upload` (`POST`, multipart `file` + optional `folder`) uses the same auth. Folder names are limited to
`[a-z0-9_-]` segments so uploads cannot escape `/incial-web`.

Server actions are public endpoints too — every mutation in `service.actions.ts` re-checks the session.

## Important: where the data lives

Content is stored on the **server's filesystem**. Local `data/*.json` and production `data/*.json` are
independent copies. Edits made in the production admin do not appear on your laptop, and deploying a build
that contains older `data/*.json` files overwrites the production edits. See [deployment.md](deployment.md).
