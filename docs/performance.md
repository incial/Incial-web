# Performance

## Decisions

- **Few dependencies**: runtime dependencies are limited to what the site renders or calls. The globe uses
  `d3-geo` + `d3-timer` instead of the whole `d3` bundle.
- **Images**: large local images in `public/images` were resized to ≤1920 px and recompressed. Keep new
  local assets under ~500 KB; put anything bigger on ImageKit. The 80 MB brochure PDF is **streamed** from
  disk by `/api/download-brochure` (never read into memory) — compress it when possible.
- **Caching**: `/logo/*` is cached for 30 days. `/images/*` and `/clients/*` are deliberately *not*
  long-cached, because files there can be replaced under the same name and would show stale pictures.
- **Fonts**: `next/font` with `display: swap`, two families (Poppins, Noto Sans), four weights each.
- **Server components** for data-driven pages (blogs, case studies) keep client JavaScript small.
- **Atomic content writes** avoid corrupt JSON if the process dies mid-write.

## Targets

| Metric | Target |
| --- | --- |
| LCP | < 2.5 s |
| INP | < 200 ms |
| CLS | < 0.1 |

Measure with Lighthouse on the production build, mobile profile, at 320 / 768 / 1440 px.

## Mobile animation guidelines

The mobile layout (`components/mobile/`) follows these rules; keep them when editing:

- Animate only `transform` and `opacity`. Promote heavy layers with `transform: translateZ(0)`; use
  `will-change` sparingly.
- Throttle scroll handlers with `requestAnimationFrame` and register them as `{ passive: true }`.
- Prefer `IntersectionObserver` to scroll listeners for reveal-on-scroll.
- Memoise leaf components (`memo`) and callbacks (`useCallback`) that sit in long lists or slides.
- Honour `prefers-reduced-motion`.
- Cancel in-flight work on unmount (`AbortController`, `clearTimeout`, `cancelAnimationFrame`).

## Ideas not done yet

- Serve ImageKit images with `?tr=` width/format transforms and `sizes`.
- Split the home page so only the active phase's code loads (`next/dynamic`).
- Replace `useDevice` JS switching with CSS breakpoints where the markup is equivalent.
