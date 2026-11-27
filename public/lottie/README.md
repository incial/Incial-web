# Glass Lottie animations

Blue glass elements for the site (not for the LearnTogether pages). Each animation is built from the
original artwork in `images/`, so the gradients and glass texture are exactly the artwork's; the
Lottie file adds the motion. Edit the motion in the generator and re-run it instead of hand-editing
the JSON:

```
node scripts/generate-lottie.mjs
```

| File | Artwork | Motion | Loop |
| --- | --- | --- | --- |
| `tiles-matrix.json` | tiles cut from `images/tiles-wave.webp` | The tile matrix (staircase from the top right corner); every tile is its own layer, deep tiles where the matrix is darkest; its grid carries on past the tiles as dark-blue outline cells (no fill) that fade out; a wave pulses out from the corner and edge tiles blink | 8 s |
| `tiles-wave.json` | `images/tiles-wave.webp` | Every tile is its own layer and bobs in a wave across the valley | 6 s |
| `tiles-cluster.json` | `images/tiles-cluster.webp` | Floats and sways; a light glint sweeps across the glass | 7 s |
| `glass-ribbon.json` | `images/glass-ribbon.webp` | Fixed; a light glint sweeps across the glass | 6 s |
| `glass-twist.json` | `images/glass-twist.webp` | Floats and sways; glint | 8 s |
| `glass-ring.json` | `images/glass-ring.webp` | Fixed; a light glint sweeps across the glass | 7 s |

The artwork keeps its own transparent background. Image paths inside the JSON are relative
(`images/…`), so the files and the `images/` folder must stay together. The tile positions for
`tiles-wave` come from `scripts/lottie-tiles-wave-grid.json`.

Preview them all at `/lottie/preview.html` while the dev server runs.

## Using one on a page

Use `components/ui/GlassLottie.tsx`:

```tsx
<GlassLottie name="tiles-cluster" interactive flip className="absolute left-0 top-0 aspect-[950/1387] h-full" />
```

- `interactive`: leans toward the pointer and plays faster while the pointer moves quickly.
- `flip`: mirrors it (for the copy on the opposite side); `rotate`: turns it in its box.
- `still`: shows the artwork without playing (no float or glint); `scrollSpin`: turns it flat as the
  page scrolls; `drift`: drifts it a little toward the pointer, flat (no 3D).
- It loads the player only when it nears the screen, plays only while visible, and shows a still
  frame for `prefers-reduced-motion`. Give the box the artwork's proportions so nothing is cropped.

On the site: `tiles-matrix` in both top corners of the Products banner and the About Us heading
(fixed, 20%; one whole matrix on phones); `glass-ring` in the white
space beside "Let's explore our products." and beside the About Us closing statement (fixed, 50%;
only its glint moves). `glass-ring` and `glass-ribbon` are fixed in place: only a glint sweeps across.
